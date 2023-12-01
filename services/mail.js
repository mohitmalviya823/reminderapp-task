const nodemailer = require("nodemailer");
const dbCalls = require("../db/main");
require("dotenv").config();

module.exports = {
  mailService: async function () {
    try {
      let mailTransporter = nodemailer.createTransport({
        service: process.env.REMINDER_EMAIL_SERVICE,
        auth: {
          user: process.env.REMINDER_SENDER_EMAIL,
          pass: process.env.REMINDER_EMAIL_PASS,
        },
      });

      const today = new Date();
      const todayDate = today.getDate();
      const todayMonth = today.getMonth();
      const todayYear = today.getFullYear();
      const events = await dbCalls.getReminders("all");
      events.forEach((event) => {
        const eventDate = new Date(event.date).getDate();
        const eventMonth = new Date(event.date).getMonth();
        const eventYear = new Date(event.date).getFullYear();

        const isSameDate =
          eventDate === todayDate &&
          eventMonth === todayMonth &&
          todayYear === eventYear;

        if (isSameDate) {
          let mailDetails = {
            from: process.env.REMINDER_SENDER_EMAIL,
            to: event.createdBy,
            subject: event.reminder,
            text: event.description,
          };

          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
              console.log("error occurred", err.message);
            } else {
              console.log("---------------------");
            }
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
  },
};
