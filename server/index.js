const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
// const morganBody = require('morgan-body');
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
// const fs = require('fs');
// const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const constants = require("./constants");
const { validationResult } = require("express-validator");
const { validateLogin } = require("./validateLogin");

dotenv.config();

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access-node.log'), { flags: 'a' });
const app = express();

app.use(express.json());
app.use(cookieParser());

// initialise in memory database
const db = new sqlite3.Database(":memory:");
// populate database
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users ( ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT NOT NULL, USERNAME TEXT NOT NULL, PASSWORD CHAR(50));"
  );
  const stmt = db.prepare(
    "INSERT INTO users (name, username, password) VALUES (?, ?, ?);"
  );
  for (let i = 1; i <= 3; i++) {
    stmt.run(`Name ${i}`, `username${i}`, `pass${i}`);
  }
  stmt.finalize();
});

// morganBody(app, { stream: accessLogStream, noColors: true, logAllReqHeader: true, logAllResHeader: true });
// or
// morganBody(app, { stream: accessLogStream, noColors: true });

const baseUrl = "/api/v1";
const refreshTokens = [];
const port = 4000;

let origin = "http://localhost";
console.log("----environment----", process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") origin = origin + ":5173";
console.log("----origin----", origin);

app.use(
  cors({
    origin,
    credentials: true,
  })
);

function authenticateToken(req, res, next) {
  jwt.verify(
    req.cookies.accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  );
}

function renderTimeStamp() {
  const date = new Date();
  return `${date.getHours()}:${date.getMinutes()}:${date.getMilliseconds()}`;
}

app.get(baseUrl + "/health", (req, res) => {
  console.log("Liveness probe ", renderTimeStamp());
  res.status(200).send("OK");
});

app.get(baseUrl + "/", (req, res) => {
  console.log("Readiness probe ", renderTimeStamp());
  res.status(200).send("OK");
});

app.post(baseUrl + "/login", validateLogin, (req, res) => {
  // setTimeout to see loader in Login.tsx
  // setTimeout(()=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    db.all(
      "SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1",
      [username, password],
      (err, rows) => {
        if (err) {
          console.log(err);
          return;
        }
        if (rows.length) {
          const user = {
            id: rows[0].ID,
            name: rows[0].NAME,
            username: rows[0].USERNAME,
          };
          const accessToken = generateAccessToken(user);
          const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "30min",
          });
          refreshTokens.push(refreshToken);
          res.cookie("accessToken", accessToken, { httpOnly: true });
          res.cookie("refreshToken", refreshToken, { httpOnly: true });
          return res.status(200).json({ msg: constants.LOGIN_MESSAGE, user });
        }
        res.status(403).json({ msg: "Bad username or password" });
      }
    );
  // }, 1500)
});

app.post(baseUrl + "/token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.cookie("accessToken", accessToken, { httpOnly: true });
  });
});

app.delete(baseUrl + "/logout", (req, res) => {
  refreshTokens.filter((token) => token !== req.cookies.refreshToken);
  res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });
  res.cookie("accessToken", "", { httpOnly: true, expires: new Date(0) });
  res.json({ msg: "HTTP-only tokens has been removed!" });
});

app.get(baseUrl + "/dashboard", authenticateToken, (req, res) => {
  res.json({ message: "welcome to dasboard", user: req.user });
});

app.get(baseUrl + "/clear", (req, res) => {
  const refreshTokens = [];
  res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });
  res.cookie("accessToken", "", { httpOnly: true, expires: new Date(0) });
  res.json({
    message: "refresh token array is empty " + JSON.stringify(refreshTokens),
  });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

app.listen(port, () => {
  console.log("Authentication service started on port " + port);
});
