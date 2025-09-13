const Listing = require("../models/listing");
const Review = require("../models/review");

// CREATE REVIEW
module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  // Sets the review author name of currently logged in user is
  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "New Review Added!");
  res.redirect(`/listings/${listing._id}`);
};

// DELETE REVIEW
module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // removes review from listing also
  await Review.findByIdAndDelete(reviewId); // deletes review

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};
