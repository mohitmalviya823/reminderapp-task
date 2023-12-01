const today = new Date();

const events = [
  {
    date: new Date().toISOString(),
    reminder: `Mum's birthday`,
    description: "Happy Birthday",
  },
  {
    date: new Date("2022").toISOString(),
    reminder: `Go for marriage shopping`,
    description: "Go to cheap market",
  },
  {
    date: new Date("2021-10").toISOString(),
    reminder: `Call bank`,
    description: "Call bank and ask queries",
  },
  {
    date: new Date().toISOString(),
    reminder: `Work on certain task`,
    description: "Sleep like you always do",
  },
];

module.exports = events;
