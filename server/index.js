const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
// const morganBody = require('morgan-body');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
// const fs = require('fs');
// const path = require('path');

dotenv.config();

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access-node.log'), { flags: 'a' });
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

// morganBody(app, { stream: accessLogStream, noColors: true, logAllReqHeader: true, logAllResHeader: true });
// or
// morganBody(app, { stream: accessLogStream, noColors: true });

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

let refreshTokens = [];

function authenticateToken(req, res, next) {
    jwt.verify(req.cookies.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.post('/login', (req, res) => {
    const { username, password } = req.body
    const user = { name: username };
    // todo compare username and password from database
    if (username === "mike" && password === "123") {
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30min" });
        refreshTokens.push(refreshToken);
        res.cookie('accessToken', accessToken, { httpOnly: true })
        res.cookie('refreshToken', refreshToken, { httpOnly: true })
        return res.status(200).send("user is loggedin");
    }
    res.status(403).json({ msg: "Bad username or password" });
});

app.post('/token', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken == null) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ name: user.name });
        res.cookie('accessToken', accessToken, { httpOnly: true, })
    });
});

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
    res.cookie('refreshToken', "", { httpOnly: true, expires: new Date(0) })
    res.cookie('accessToken', "", { httpOnly: true, expires: new Date(0) })
    res.send('HTTP-only tokens has been removed!');
});

app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

app.get('/clear', (req, res) => {
    refreshTokens = []
    res.cookie('refreshToken', "", { httpOnly: true, expires: new Date(0) })
    res.cookie('accessToken', "", { httpOnly: true, expires: new Date(0) })
    res.json({ message: "refresh token array is empty " + JSON.stringify(refreshTokens) });
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

app.listen(4000, () => {
    console.log('Authentication service started on port 4000');
});
