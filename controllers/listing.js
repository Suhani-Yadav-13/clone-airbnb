const Listing = require("../models/listing");
const NodeGeocoder = require("node-geocoder");

// Geocoder setup (OpenStreetMap - free, no API key needed)
const geocoder = NodeGeocoder({
  provider: "openstreetmap"
});

// INDEX
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// NEW
module.exports.new = (req, res) => {
  res.render("listings/new.ejs");
};

// SHOW
module.exports.show = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing Does Not Exist");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// CREATE
module.exports.create = async (req, res) => {
  const newListing = new Listing(req.body.listing);

  // Owner
  newListing.owner = req.user._id;

  // Image (Cloudinary)
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  // Geocode location
  const geoData = await geocoder.geocode(newListing.location);
  if (geoData.length) {
    newListing.geometry = {
      type: "Point",
      coordinates: [geoData[0].longitude, geoData[0].latitude],
    };
  } else {
    newListing.geometry = {
      type: "Point",
      coordinates: [77.209, 28.6139], // fallback Delhi
    };
  }

  await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect(`/listings/${newListing._id}`);
};

// EDIT
module.exports.edit = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing Does Not Exist");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// UPDATE
module.exports.update = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing Does Not Exist");
    return res.redirect("/listings");
  }

  // Store old location for comparison
  const oldLocation = listing.location;

  // Update fields
  listing.set({ ...req.body.listing });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  // Re-geocode if location changed
  if (req.body.listing.location && req.body.listing.location !== oldLocation) {
    const geoData = await geocoder.geocode(req.body.listing.location);
    if (geoData.length) {
      listing.geometry = {
        type: "Point",
        coordinates: [geoData[0].longitude, geoData[0].latitude],
      };
    }
  }

  await listing.save();
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${listing._id}`);
};

// DELETE
module.exports.delete = async (req, res) => {
  let { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};
