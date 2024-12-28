const { check } = require("express-validator");

const usernameLen = 5;
const passwordLen = 5

const validateLogin = [
  check('username').isLength({ min: usernameLen }).withMessage(`Username must be at least ${usernameLen} characters long`),
  check('password').isLength({ min: passwordLen }).withMessage(`Password must be at least ${passwordLen} characters long`),
];

exports.validateLogin = validateLogin;
