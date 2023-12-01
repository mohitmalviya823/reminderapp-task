const express = require("express");
const dbCalls = require("./db/main");
const passport = require("passport");
const app = express();
const connectEnsureLogin = require("connect-ensure-login");
const User = require("./db/schemas/user");
const httpStatusCodes = require("http-status-codes");

const { StatusCodes } = httpStatusCodes;

app.get("/", connectEnsureLogin.ensureLoggedIn("/signin"), async (req, res) => {
  let reminders = [];
  try {
    reminders = await dbCalls.getReminders(req.user.email);
  } catch (e) {}

  const currentDate = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('en-US', options);

  res.render("main", {
    layout: "index",
    reminders: reminders,
    minDate: new Date().toISOString().split("T")[0],
    username: req.user.name,
    currentDate: formattedDate, // Add the current date to the rendering context
  });
});

app.post(
  "/save-reminder",
  connectEnsureLogin.ensureLoggedIn("/signin"),
  async (req, res) => {
    try {
      const reminder = await dbCalls.saveReminder({
        ...req.body,
        createdBy: req.user.email,
      });
      res
        .status(StatusCodes.OK)
        .render("thank-you", { layout: "index", data: reminder, saved: true });
    } catch (e) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
    }
  }
);

app.get("/reminders", connectEnsureLogin.ensureLoggedIn("/signin"), async (req, res) => {
  try {
    const reminders = await dbCalls.getReminders(req.user.email);
    res.render("reminders", { layout: "index", reminders, username: req.user.name });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
  }
});

app.post("/delete-reminder", connectEnsureLogin.ensureLoggedIn("/signin"), async (req, res) => {
  const reminderId = req.body.id;
  try {
    // Delete the reminder
    await dbCalls.deleteReminder(reminderId);

    // Fetch all reminders after deletion
    const allReminders = await dbCalls.getReminders(req.user.email);

    // Render the "thank-you" page with the updated reminders
    res.render("thank-you", { layout: "index", reminders: allReminders, deleted: true });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", { layout: "index" });
});

app.get("/signin", (req, res) => {
  if (req.user) {
    res.redirect("/");
  } else {
    res.render("login", { layout: "index" });
  }
});

app.post("/register", async (req, res) => {
  try {
    User.register(
      { email: req.body.email, name: req.body.name, _id: req.body.email },
      req.body.password,
      async function (err, user) {
        if (err) {
          console.log(err.name, "error");
          if (err.name === "UserExistsError") {
            res.status(StatusCodes.CONFLICT).send(err.message);
          } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
          }
        } else {
          // User registration successful, now authenticate the user
          await User.authenticate()(req.body.email, req.body.password, async (authError, authenticatedUser) => {
            if (authError) {
              console.log(authError);
              res.status(StatusCodes.UNAUTHORIZED).send("Authentication failed");
            } else {
              // Redirect if authentication is successful
              res.redirect("/");
            }
          });
        }
      }
    );
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
  }
});

app.post("/login", passport.authenticate("local"), function (req, res) {
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  req.logout(function (err, data) {
    res.redirect("/signin");
  });
});

app.get("/set-reminder", connectEnsureLogin.ensureLoggedIn("/signin"), (req, res) => {
  res.render("setrim", { layout: "index", username: req.user.name });
});

app.get("/delete-reminder", connectEnsureLogin.ensureLoggedIn("/signin"), async (req, res) => {
  try {
    // Fetch all reminders
    const allReminders = await dbCalls.getReminders(req.user.email);
    
    // Render the "delete" page with all reminders
    res.render("delete", { layout: "index", reminders: allReminders, username: req.user.name });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
  }
});


app.get("/modify-reminder", connectEnsureLogin.ensureLoggedIn("/signin"), async (req, res) => {
  try {
    const allReminders = await dbCalls.getReminders(req.user.email);

    res.render("modify-reminder", { layout: "index", reminders: allReminders, username: req.user.name });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
  }
});


app.get("/modify-reminder/:id", connectEnsureLogin.ensureLoggedIn("/signin"), async (req, res) => {
  try {
    const reminderId = req.params.id;
    const reminder = await dbCalls.getReminderById(reminderId);

    console.log("Retrieved reminder:", reminder); // Log the retrieved reminder

    if (!reminder) {
      res.status(StatusCodes.NOT_FOUND).send("Reminder not found");
      return;
    }

    // Format the date before rendering the template
    const formattedDate = reminder.date.toISOString().split('T')[0];

    res.render("mdfyrem", { layout: "index", reminder, formattedDate, username: req.user.name });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
  }
});


// Add this route handler in your Express application
app.post("/modify-reminder/:id", connectEnsureLogin.ensureLoggedIn("/signin"), async (req, res) => {
  try {
    const reminderId = req.params.id;
    const updatedReminder = {
      reminder: req.body.reminder,
      description: req.body.description,
      date: req.body.newDate, // Use the modified date from the form
    };

    // Add logic to update the reminder in the database
    await dbCalls.updateReminder(reminderId, updatedReminder);

    res.status(StatusCodes.OK).render("thank-you", { layout: "index", updated: true });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
  }
});

module.exports = app;
