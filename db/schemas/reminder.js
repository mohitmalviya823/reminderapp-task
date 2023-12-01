const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
  {
    reminder: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { collection: "reminders" }
);

const Reminder = mongoose.model("Reminder", ReminderSchema);

module.exports = Reminder;
