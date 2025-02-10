const { check } = require("express-validator");

const usernameLen = 5;
const passwordLen = 5

const validateLogin = [
  check('username').escape().isLength({ min: usernameLen }).withMessage(`Username must be at least ${usernameLen} characters long`),
  check('password').isLength({ min: passwordLen }).withMessage(`Password must be at least ${passwordLen} characters long`),
];


function renderTimeStamp() {
  const date = new Date();
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
}

module.exports = { validateLogin, renderTimeStamp }

