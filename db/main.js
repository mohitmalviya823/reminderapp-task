const mongoose = require("mongoose");
const reminderModel = require("./schemas/reminder");
const userModel = require("./schemas/user");
require("dotenv").config();

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

async function connectDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/reminder', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
  });
  const db = mongoose.connection;
  db.on("error", (error) => console.log(error, "error connecting"));
  db.once("open", () => console.log("connection is open now"));
}

async function createUser(userDetails) {
  try {
    const user = new userModel({ ...userDetails, _id: userDetails.email });
    await user.save();
    return user;
  } catch (e) {
    throw e;
  }
}

async function getReminders(email) {
  try {
    let queryParams = {};
    if (email !== "all") {
      queryParams = { createdBy: email };
    }
    const reminders = await reminderModel.find(queryParams);
    let updatedReminders = reminders.map((reminder) => {
      let fullDate = new Date(reminder.date);
      let date = fullDate.getDate();
      let month = fullDate.getMonth();
      let year = fullDate.getFullYear();

      return {
        id: reminder._id,
        reminder: reminder.reminder,
        description: reminder.description,
        date: reminder.date,
        displayDate: `${monthNames[month]} ${date}, ${year}`,
      };
    });
    console.log(updatedReminders);
    return updatedReminders;
  } catch (error) {
    throw error;
  }
}
async function getReminderById(reminderId) {
  try {
    const reminder = await reminderModel.findById(reminderId);
    return reminder;
  } catch (error) {
    // Log the error for debugging
    console.error("Error in getReminderById:", error);
    throw error;
  }
}

async function saveReminder(reminderData) {
  const reminder = new reminderModel(reminderData);
  try {
    await reminder.save();
    return reminder;
  } catch (error) {
    throw error;
  }
}

async function deleteReminder(id) {
  try {
    const res = await reminderModel.deleteOne({ _id: id });
    return true;
  } catch (e) {
    throw e;
  }
}

module.exports = {
  getReminderById,
  connectDB,
  getReminders,
  saveReminder,
  deleteReminder,
  createUser,
};
