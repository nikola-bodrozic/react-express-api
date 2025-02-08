const express = require('express');
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { loginMessage, pd1, pd2 } = require("./constants");
const fs = require('fs');
require('dotenv').config();
const db = require('./db');
const https = require('https');
const { body, validationResult } = require('express-validator');
const baseUrl = "/api/v1";
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY;
app.use(express.json());

let origin = "http://localhost";
console.log("environment:", process.env.NODE_ENV);
if (process.env.NODE_ENV.toLowerCase() === "development") origin = origin + ":5173";
console.log("origin for CORS:", origin);

app.use(
  cors({
    origin
  })
);

// Middleware to check JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.sendStatus(401);
 
        const [rows] = await db.execute('SELECT * FROM sw_tokens WHERE token = ? AND is_invalidated = 0', [token]);
        const tokenData = rows[0];
        if (!tokenData) return res.sendStatus(403);
 
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            req.token = token;
            next();
        });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};
 
// Route to register a new user
app.post(baseUrl+'/register', [
    body('username').isString().notEmpty().withMessage('Username is required').escape(),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
 
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
 
        const query = 'INSERT INTO sw_users (username, password) VALUES (?, ?)';
        await db.execute(query, [username, hashedPassword]);
 
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
 
// Route to login and get JWT token
app.post(baseUrl+'/login', [
    body('username').isString().notEmpty().withMessage('Username is required').escape(),
    body('password').isString().notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
 
    try {
        const { username, password } = req.body;
 
        const [users] = await db.execute('SELECT * FROM sw_users WHERE username = ?', [username]);
        const user = users[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).send('Invalid username or password');
        }
 
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
 
        const query = 'INSERT INTO sw_tokens (token, user) VALUES (?, ?)';
        await db.execute(query, [token, username]);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
 
// Protected route
app.get(baseUrl+'/dashboard', authenticateToken, (req, res) => {
  const pieDataArr = [];
  pieDataArr.push(pd1);
  pieDataArr.push(pd2);
  res.json({
    message: "welcome to dashboard",
    pieDataArr,
  });
});
 
// Route to logout and mark token as expired
app.post(baseUrl+'/logout', authenticateToken, async (req, res) => {
    try {
        const token = req.token;
        const query = 'UPDATE sw_tokens SET is_invalidated = 1 WHERE token = ?';
        await db.execute(query, [token]);
        res.send('Logged out successfully');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
 
// Route to delete expired tokens
app.delete(baseUrl+'/deleteTokens', async (req, res) => {
    try {
        const currentTime = Math.floor(Date.now() / 1000);

        const [tokens] = await db.query('SELECT * FROM sw_tokens');
        let deletedCount = 0; // Counter for deleted tokens

        for (const tokenData of tokens) {
            try {
                const decodedToken = jwt.verify(tokenData.token, JWT_SECRET);
                console.log(decodedToken)
                if (decodedToken.exp <= currentTime) {
                    await db.query('DELETE FROM sw_tokens WHERE user = ?', [tokenData.user]);
                    deletedCount++;
                }
            } catch (err) {
                if (err.name === 'TokenExpiredError') {
                    await db.query('DELETE FROM sw_tokens WHERE user = ?', [tokenData.user]);
                    deletedCount++;
                }
            }
        }

        const responseMessage = deletedCount === 0 
            ? 'No tokens deleted' 
            : `${deletedCount} tokens deleted`;

        res.send(`${responseMessage}`);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
 
// Read the SSL certificate and key
const privateKey = fs.readFileSync('/etc/ca-certificates/key.pem', 'utf8');
const certificate = fs.readFileSync('/etc/ca-certificates/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

https.createServer(credentials, app).listen(PORT, () => {
    console.log(`HTTPS Server running on https://localhost:${PORT}`);
})