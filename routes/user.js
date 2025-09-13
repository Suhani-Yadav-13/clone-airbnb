const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/user.js");


router.route("/signup")
.get(userController.renderSignup)
.post(wrapAsync(userController.postSignup));


// Login - get request for form
router.route("/login")
.get( userController.renderLogin)
// post request - PASSPORT helps here to check if user already registered before login
.post(
  saveRedirectUrl, // Saves url before authentication, Its job is usually to remember where the user wanted to go before login.
  passport.authenticate("local", {
    failureRedirect: "/login", // authentication before login, in these three code lines
    failureFlash: true,
  }),
  userController.postLogin
);

// Logout - req.logout takes error callback as a parameter
router.get("/logout", userController.logout);

module.exports = router;
 

