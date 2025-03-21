const express = require('express');
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pd1, pd2 } = require("./constants");
require('dotenv').config();
const db = require('./db');
const { validateLogin } = require("./utils");
const { body, validationResult } = require('express-validator');
const baseUrl = "/api/v1";
const app = express();
const PORT = process.env.PORT || 4000;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY;
app.use(express.json());

console.log("environment:", process.env.NODE_ENV);

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
}));


// Middleware to check JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.sendStatus(401);

        const [rows] = await db.execute('SELECT * FROM sw_tokens WHERE token = ? AND is_invalidated = 0', [token]);
        const tokenData = rows[0];
        if (!tokenData) return res.sendStatus(403);

        jwt.verify(token, TOKEN_SECRET, (err, user) => {
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

// Route to login and get JWT token
app.post(baseUrl + '/login', validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(401).json({ errors: errors.array() });
    try {
        const { username, password } = req.body;
        const [users] = await db.execute('SELECT * FROM sw_users WHERE username = ?', [username]);
        const user = users[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).send('Invalid username or password');
        }
        const token = jwt.sign({ username }, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRY });
        const query = 'INSERT INTO sw_tokens (token, user) VALUES (?, ?)';
        await db.execute(query, [token, username]);
        res.json({ token, username });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Protected route
app.get(baseUrl + '/dashboard', authenticateToken, async (req, res) => {
    const pieDataArr = [];
    pieDataArr.push(pd1);
    pieDataArr.push(pd2);
    let posts = [];
    try {
        [posts] = await db.execute('SELECT * FROM sw_posts');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    } finally {
        res.json({
            message: "welcome to dashboard",
            pieDataArr,
            posts
        });
    }
});

app.delete(baseUrl + '/posts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;
    try {
        const result = await db.execute('DELETE FROM sw_posts WHERE id = ? AND username = ?', [id, username]);
        if (result[0].affectedRows > 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(403);
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post(baseUrl + '/logout', authenticateToken, async (req, res) => {
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

app.delete(baseUrl + '/deleteTokens', async (req, res) => {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const [tokens] = await db.query('SELECT * FROM sw_tokens');
        let deletedCount = 0;
        for (const tokenData of tokens) {
            try {
                const decodedToken = jwt.verify(tokenData.token, TOKEN_SECRET);
                if (decodedToken.exp <= currentTime) {
                    await db.execute('DELETE FROM sw_tokens WHERE user = ?', [tokenData.user]);
                    deletedCount++;
                }
            } catch (err) {
                if (err.name === 'TokenExpiredError') {
                    await db.execute('DELETE FROM sw_tokens WHERE user = ?', [tokenData.user]);
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

app.listen(PORT, () => {
    console.log(`API service started on port ${PORT}, API base url is ${baseUrl}`);
});