// Get coordinates & listing details from EJS
const coords = window.listingCoordinates || [77.209, 28.6139]; // fallback Delhi
const title = window.listingTitle || "Listing";
const location = window.listingLocation || "Location not available";

// Initialize Leaflet map
var map = L.map("map").setView([coords[1], coords[0]], 13);

// OpenStreetMap tiles
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Marker at listing location
var marker = L.marker([coords[1], coords[0]]).addTo(map);

// Bind popup to marker
marker.bindPopup(`<b>${title}</b><br>${location}`).openPopup();

// Optional: popup on map click
var popup = L.popup();
function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}
map.on("click", onMapClick);
