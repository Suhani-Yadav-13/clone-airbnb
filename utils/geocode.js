// utils/geocode.js
async function getCoordinates(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "airbnb-clone/1.0" }, // required by Nominatim
  });

  const data = await response.json();

  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  }

  return null; // no results found
}

module.exports = getCoordinates;
