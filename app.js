var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.set("view engine","ejs");
mongoose.connect("mongodb://localhost/yelpcamp",{useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended:true}));
// seedDB();
app.use(require("express-session")({
    secret: "cats are best and cute",
    resave:false,
    saveUninitialized:false
}));
var flash = require("connect-flash");
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.get("/",function(req,res){
    res.render("landing");
});
//index route
app.get("/campground",function(req,res){
    
    Campground.find({},function(err,campgrounds){
        if(err)
        {
            consile.log(err);
        }else
        {
            res.render("campground/index",{campground:campgrounds});
        }
    });
    
});
//new route
app.get("/campground/new",isLoggedIn,function(req,res){
    console.log(req.user);
    res.render("campground/new");
});
//create route
app.post("/campground",isLoggedIn,function(req,res){
    
    var newCampground = req.body.newcampground;
    var newimage = req.body.image;
    var newdecription = req.body.description;
    var newauthor = {
        id : req.user._id,
        username: req.user.username
    };
    Campground.create({
        name:newCampground,
        image:newimage,
        description:newdecription,
        author:newauthor
    },function(err,campground){
        if(err)
        {
            console.log(err);
        }else
        {
            req.flash("success","Campground is Succssfully added ");
            res.redirect("/campground");
        }
    });
});
//show route
app.get("/campground/:id",function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err)
        {
            console.log(err);
        }else
        {//render the show template
            // console.log(foundCampground);
            res.render("campground/show",{campground:foundCampground});
        }
    });
    
});
//edit routes
app.get("/campground/:id/edit",checkCampgroundOwnership,function(req,res){
    
    Campground.findById(req.params.id,function(err,foundCampground){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("campground/edit",{foundCampground:foundCampground});
        }
    });
    
});
//update route
app.put("/campground/:id",checkCampgroundOwnership,function(req,res){

    var updatecampground = {
        name : req.body.newcampground,
        image : req.body.image,
        description: req.body.description
    };

    Campground.findByIdAndUpdate(req.params.id,updatecampground,function(err,campground){
        if(err){
            res.redirect("/campground");
        }
        else{
            req.flash("success","Campground is Succssfully updated ");
            res.redirect("/campground/"+req.params.id);
        }
    });

});
//delete route
app.delete("/campground/:id",checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndDelete(req.params.id,function(err){
        if(err){
            res.redirect("/campground");
        }
        else{
            req.flash("success","Campground is Succssfully deleted ");
            res.redirect("/campground");
        }
    });
});
//=========================
//COMMENT ROUTES
//=========================
app.get("/campground/:id/comments/new",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("comments/new",{campground:campground});
        }
    });
    
});
app.post("/campground/:id/comments",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err)
        {
            console.log(err);
            res.redirect("/campground");
        }
        else{
            
            Comment.create(req.body.comments,function(err,comment){
                if(err)
                {
                    console.log(err);
                    res.redirect("/campground");
                }
                else{
                    // console.log(req.user.username);
                    comment.author = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success","Successfully added comment");
                    res.redirect("/campground/"+req.params.id);
                }
            });
        }
    });
});


//=========================
//AUTHENTICATION ROUTES
//=========================
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    User.register(new User({username: req.body.username}),req.body.password,function(err,user){
        if(err)
        {
            req.flash("error", err.message);
            console.log(err);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to Yelpcamp "+ user.username);
            res.redirect("/campground");
        });
    });
});

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",passport.authenticate("local",{
    successRedirect: "/campground",
    failureRedirect: "/login"
}),function(req,res){});

app.get("/logout",function(req,res){
    req.logOut();
    req.flash("success","Logged you out");
    res.redirect("/");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        
        return next();
    }
    req.flash("error","You need to be logged in to do that");
    res.redirect("/login");
}

function checkCampgroundOwnership(req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id,function(err,foundCampground){
            if(err)
            {
                req.flash("error","Campground not found");
                res.redirect("back");
            }
            else
            {
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error","You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error","You need to be logged in to do that");
        res.redirect("back");
    }

}

app.listen(3000,function(){
    console.log("yelpcamp ka server connected");
});