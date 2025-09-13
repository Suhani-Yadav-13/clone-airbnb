const User = require("../models/user");

// RENDER SIGN UP
module.exports.renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

// POST SIGNUP
module.exports.postSignup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    // Automatic Login after SignUp by req.login(registeredUser, (cb)) method of passport
    req.login(registeredUser, (err) => {
      if (err) {
        // if any error while signing up
        return next(err);
      }
      // if successfully signed up
      req.flash("success", "User registered successfully");
      res.redirect("/listings");
    });
  } catch (e) {
    // catch if user already exists
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// RENDER LOGIN
module.exports.renderLogin = (req, res) => {
  res.render("users/login.ejs");
};

// POST LOGIN
module.exports.postLogin = async (req, res) => {
  req.flash("success", "Welcome Back! You're logged in");

  // will not throw error if try to login directly from home(listings route)
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl); // after login, comes at page on which we are before login
};

// LOGOUT
module.exports.logout = (req, res, next) => {
  if (req.isAuthenticated()) {
    // ✅ check if user is logged in
    req.logout((err) => {
      // logged out if the user logged in
      if (err) {
        return next(err);
      }
      req.flash("success", "You're logged out!");
      res.redirect("/listings");
    });
  } else {
    // If not logged in, just redirect silently (no flash message)
    res.redirect("/listings");
  }
};
