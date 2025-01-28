const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const os = require("os");
const sqlite3 = require("sqlite3").verbose();
const { loginMessage, pd1, pd2 } = require("./constants");
const { validationResult } = require("express-validator");
const { validateLogin, renderTimeStamp } = require("./utils");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// create in memory database and 2 tables
const db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users ( ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT NOT NULL, USERNAME TEXT NOT NULL, PASSWORD CHAR(50));"
  );
  let stmt = db.prepare(
    "INSERT INTO users (name, username, password) VALUES (?, ?, ?);"
  );
  for (let i = 1; i <= 3; i++) {
    stmt.run(`Name ${i}`, `username${i}`, `pass${i}`);
  }
  stmt.finalize();
  stmt = null;
  db.run(
    "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, post TEXT NOT NULL, username CHAR(50) NOT NULL);"
  );
  stmt = db.prepare("INSERT INTO items (post, username) VALUES (?, ?);");
  for (let i = 1; i <= 50; i++) {
    stmt.run(`Post ${i} some text`, `username${i}`);
  }
  stmt.finalize();
});

const baseUrl = "/api/v1";
const refreshTokens = [];
const port = 4000;

let origin = "http://localhost";
console.log("environment:", process.env.NODE_ENV);
if (process.env.NODE_ENV.toLowerCase() === "development") origin = origin + ":5173";
console.log("origin for CORS:", origin);

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

app.get(baseUrl + "/health", (req, res) => {
  console.log("Liveness probe ", renderTimeStamp());
  res.status(200).send("OK");
});

app.get(baseUrl + "/pod", (req, res) => {
  const pod = {
    hostname: os.hostname() || "no info about host name",
  };
  res.json(pod);
});

app.get(baseUrl + "/", (req, res) => {
  console.log("Readiness probe ", renderTimeStamp());
  res.status(200).send("OK");
});

app.post(baseUrl + "/login", validateLogin, (req, res) => {
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
        return res.status(200).json({ msg: loginMessage, user });
      }
      res.status(403).json({ msg: "Bad username or password" });
    }
  );
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
  const pieDataArr = [];
  pieDataArr.push(pd1);
  pieDataArr.push(pd2);
  res.json({
    message: "welcome to dashboard",
    pieDataArr,
  });
});

app.get(baseUrl + "/table", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get page number from query, default to 1
  const pageSize = parseInt(req.query.pageSize) || 10; // Get page size from query, default to 10
  const offset = (page - 1) * pageSize;

  db.all(
    "SELECT * FROM items LIMIT ? OFFSET ?",
    [pageSize, offset],
    async (err, rows) => {
      if (err) {
        console.log(err);
        return;
      }
      if (rows.length) {
        const totalItems = await getTotalRowsCount("items");
        const totalPages = Math.ceil(totalItems / pageSize);
        res.json({
          items: rows,
          totalItems,
          totalPages,
          currentPage: page,
          pageSize,
        });
      }
    }
  );
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

function getTotalRowsCount(tableName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count);
      }
    });
  });
}

app.listen(port, () => {
  console.log(`API service started on port ${port}, API base url is ${baseUrl}`);
});
