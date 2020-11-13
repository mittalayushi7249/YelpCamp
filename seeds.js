var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var data = [
    {
        name: "Cloud's Rest",
        image: "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        desciption: "Luxury may be an element, as in early 20th century African safaris, but including accommodations in fully equipped fixed structures such as high-end sporting camps under the banner of blurs the line"
    },
    {
        name: "Cloud's Rest",
        image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        desciption: "Luxury may be an element, as in early 20th century African safaris, but including accommodations in fully equipped fixed structures such as high-end sporting camps under the banner of blurs the line"
    },
    {
        name: "Cloud's Rest",
        image: "https://images.unsplash.com/photo-1496545672447-f699b503d270?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        desciption: "Luxury may be an element, as in early 20th century African safaris, but including accommodations in fully equipped fixed structures such as high-end sporting camps under the banner of blurs the line"
    },
    {
        name: "Cloud's Rest",
        image: "https://images.unsplash.com/photo-1496545672447-f699b503d270?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        desciption: "Luxury may be an element, as in early 20th century African safaris, but including accommodations in fully equipped fixed structures such as high-end sporting camps under the banner of blurs the line"
    }
]

function seedDB(){
    //remove all campgrounds
    Campground.remove({},function(err){
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log("remove campground");
            data.forEach(function(campground){
                Campground.create(campground,function(err,camp){
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        console.log("added campground");
                        Comment.create({
                            text:"This is a great place but i wish there was internet ...",
                            author:"homer"
                        },function(err,comment){
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                camp.comments.push(comment);
                                camp.save();
                                console.log("comments added");
                            }
                        });
                    }
                });
            });
        }
    });
}
module.exports = seedDB;