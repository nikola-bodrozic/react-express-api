const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
// const morganBody = require('morgan-body');
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
// const fs = require('fs');
// const path = require('path');
const constants = require("./constants.js");

dotenv.config();

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access-node.log'), { flags: 'a' });
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

// morganBody(app, { stream: accessLogStream, noColors: true, logAllReqHeader: true, logAllResHeader: true });
// or
// morganBody(app, { stream: accessLogStream, noColors: true });

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const refreshTokens = [];
const port = 4000;

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

app.get("/health", (req, res) => {
  console.log("Liveness probe ", renderTimeStamp());
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  console.log("Readiness probe ", renderTimeStamp());
  res.status(200).send("OK");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = { name: username };
  if (username === "mike" && password === "123") {
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "30min",
    });
    refreshTokens.push(refreshToken);
    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    return res.status(200).json({ msg: constants.LOGIN_MESSAGE });
  }
  res.status(403).json({ msg: "Bad username or password" });
});

app.post("/token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.cookie("accessToken", accessToken, { httpOnly: true });
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens.filter((token) => token !== req.cookies.refreshToken);
  res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });
  res.cookie("accessToken", "", { httpOnly: true, expires: new Date(0) });
  res.json({ msg: "HTTP-only tokens has been removed!" });
});

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

app.get("/clear", (req, res) => {
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
