const mongoose = require("mongoose");
const Listing = require("../models/listing");
const NodeGeocoder = require("node-geocoder");

// Connect to your DB
mongoose.connect("mongodb://127.0.0.1:27017/wonderworld", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const geocoder = NodeGeocoder({ provider: "openstreetmap" });

async function updateOldListings() {
  const listings = await Listing.find({});
  for (let l of listings) {
    // Only update if geometry missing or empty
    if (!l.geometry || !l.geometry.coordinates || l.geometry.coordinates.length === 0) {
      const geoData = await geocoder.geocode(l.location);
      if (geoData.length) {
        l.geometry = {
          type: "Point",
          coordinates: [geoData[0].longitude, geoData[0].latitude],
        };
      } else {
        // fallback if geocoding fails
        l.geometry = { type: "Point", coordinates: [77.209, 28.6139] };
      }
      await l.save();
      console.log(`Updated: ${l.title}`);
    }
  }
  console.log("Migration completed!");
  mongoose.connection.close();
}

updateOldListings();
