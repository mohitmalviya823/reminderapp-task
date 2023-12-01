const cron = require("node-cron");
const express = require("express");
// const mailService = require("./services/mail");
const handlebars = require("express-handlebars");
const dbCalls = require("./db/main");
const Router = require("./routes");
const passport = require("passport");
const session = require("express-session"); // session middleware
const User = require("./db/schemas/user");
const bodyParser = require("body-parser"); // parser middleware

const app = express();

// cron.schedule("0 0 * * *", function () {
//   console.log("running a task every day");
//   mailService.mailService();
// });

// Register `hbs.engine` with the Express app.

app.engine(
  "hbs",
  handlebars.engine({
    layoutsDir: __dirname + "/views/layouts",
    //new configuration parameter
    extname: "hbs",
  })
);
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: "false" }));
app.use(express.json());
// Configure Sessions Middleware
app.use(
  session({
    secret: "r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 1000 * 60 }, // 1 hour
  })
);

// Configure More Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(User.createStrategy());

// To use with sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(Router);

app.listen(3001, () => {
  dbCalls.connectDB();
  console.log("application listening.....");
});
