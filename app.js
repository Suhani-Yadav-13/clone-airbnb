

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


// express router
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wondersOfWorld";

const dbURL = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbURL);
}

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("SESSION ERROR", err);
});

// demo of express sessions
const sessionOptions = {
  store,
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,  // expires/maxAge - date after 7 days and after 7 days it will asks for re-login if loggedin in any website
    httpOnly: true,  // used for security purposes
  },
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

// all these will always be written before routes else not work
app.use(session(sessionOptions));
app.use(flash());  // for flash 1st line, 2nd at listing.js, 4th flash.ejs created for styling

app.use(passport.initialize());  // init passport for each request before using it
app.use(passport.session());  // keeps a logged-in user’s data stored in the session and restores it on subsequent requests.

// LocalStrategy → checks credentials locally (not via Google/Facebook).
// User.auth() → is a helper method, It handles comparing the password hash, checking username, etc.
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());  // Saves user ID in the session.
passport.deserializeUser(User.deserializeUser()); // Use that ID to get the full user details back


// for flash 3rd line
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; // written here, bcoz req.user cannot be directly used 
  next();
});


// ****
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// custom error handler - ExpressError
app.use((req, res, next) => {   // this will shows when user searches for the route or path that doesn't exists
  next(new ExpressError(404, "Page Not Found"));   // like in this project search for /list, /random, /etc
});


app.use((err, req, res, next) => {
  // let {statusCode, message} = err;
  let {statusCode = 500, message = "Something went wrong"} = err;  // if no value in err then these default value will work
  res.status(statusCode).render("error.ejs", { err }); // (not in good way)will show actual error message if entered abcd in price while adding new listings

  //(for good design, using error.js)
  // res.render("error.ejs", {err});
});


app.listen(7777, () => {
  console.log("server is listening to port 7777");
});
