const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");


// middleware created to check if the user is logged in before adding, editing and deleting the listings
module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.user); // (here, used for checking only) with this we can check if user is logged in or not
    if(!req.isAuthenticated()){

        // listings-> Add new-> asked to Login-> login-> 
        //  Redirect at originalUrl i.e., Add new url path 
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();  // call this when user is authenticated/logged in
};


// created bcoz passport by default reset the session so path cannot be saved
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};



// for owner and non owner access for editing & deleting listings
module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "Only Listing's owner have access!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};



// Validation for middlewares
module.exports. validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
  
  if(error) {
    // console.log(error)
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else{
    next();
  }
};


//middlewares for reviews
module.exports.validateReview = (req, res, next) => {
  let {error} = reviewSchema.validate(req.body);
  if(error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else{
    next();
  }
};


// Delete review if author & owner are same
module.exports.isReviewAuthor = async(req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You're not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

