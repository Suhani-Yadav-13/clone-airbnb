
const express = require("express");
const router = express.Router({mergeParams: true});  // used to merge params of parent(first one) and child like /listings/:id/reviews if parent is associated and helps child for their work like ID HELPS REVIEWS TO ADD
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/review.js");


// Review Route - Post 
router.post("/", isLoggedIn, validateReview, wrapAsync (reviewController.createReview));


// delete review route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;
