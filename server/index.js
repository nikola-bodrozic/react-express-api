const express = require('express');
const axios = require('axios');
const validator = require('validator');
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
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

app.use(express.json());

console.log("environment:", process.env.NODE_ENV);

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
}));

const cities = [
    "Barcelona", "Bangkok", "Baltimore", "Bari", "Baton Rouge",
    "Aberdeen", "Abbeville", "Abruzzo", "Abensberg",
    "Abtsgmünd", "Abenberg", "Abtenau",
    "Aachen", "Acquaviva", "Acri", "Acquapendente", "Aci Castello",
    "Aci Catena", "Acquanegra sul Chiese", "Accrington", "Acomb", "Acton"
];

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
app.post(baseUrl + '/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM sw_users WHERE username = ?', [username]);
        const user = users[0];
        console.log(user, password)
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).json({ error: 'bad username/password' });
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

app.get(baseUrl + '/cities/:prefix', (req, res) => {
    try {
        const searchPrefix = req.params.prefix.toLowerCase();
        const minLength = 2;
        const maxLength = 20; // New: Add maximum length constraint
        const maxResults = req.query.limit || 50; // New: Add pagination support

        // Validate input
        if (searchPrefix.length < minLength) {
            return res.status(400).json({
                error: `Prefix must be at least ${minLength} characters long`
            });
        }

        if (searchPrefix.length > maxLength) {
            return res.status(400).json({
                error: `Prefix cannot exceed ${maxLength} characters`
            });
        }

        // Case-insensitive search with early exit
        const matchingCities = [];
        for (const city of cities) {
            if (city.toLowerCase().startsWith(searchPrefix)) {
                matchingCities.push(city);
                if (matchingCities.length >= maxResults) break; // Early exit when limit reached
            }
        }

        if (matchingCities.length === 0) {
            return res.status(404).json({
                message: `No cities found starting with "${searchPrefix}"`,
                suggestions: getSimilarPrefixes(searchPrefix) // New: Add suggestions
            });
        }

        res.json({
            prefix: searchPrefix,
            count: matchingCities.length,
            totalAvailable: cities.filter(c => c.toLowerCase().startsWith(searchPrefix)).length,
            cities: matchingCities,
            pagination: {
                limit: maxResults,
                hasMore: matchingCities.length < cities.filter(c => c.toLowerCase().startsWith(searchPrefix)).length
            }
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Helper function to suggest similar prefixes
function getSimilarPrefixes(prefix) {
    const prefixSet = new Set();
    cities.forEach(city => {
        const cityPrefix = city.toLowerCase().substring(0, prefix.length + 1);
        if (cityPrefix.startsWith(prefix.substring(0, prefix.length - 1))) {
            prefixSet.add(cityPrefix);
        }
    });
    return Array.from(prefixSet).sort();
}

app.get(baseUrl + '/slider', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT america, asia FROM sw_slider WHERE id=1');
        res.json(rows[0] || { america: false, asia: false });
    } catch (err) {
        console.error('GET /slider error:', err);
        res.status(500).json({ error: 'Failed to fetch slider state' });
    }
});

app.put(baseUrl + '/slider', async (req, res) => {
    const { america, asia } = req.body;

    try {
        await db.execute(`UPDATE sw_slider SET america = ?, asia = ?, updated_at = NOW() WHERE id = 1;`,[america, asia]);
        res.json({ success: true });
    } catch (err) {
        console.error('PUT /slider error:', err);
        res.status(500).json({ error: 'Failed to update slider state' });
    }
});

const getClientIp = (req) => {
  // 1. Check for 'x-forwarded-for' header (common with proxies like Nginx)
  const forwardedFor = req.headers["x-forwarded-for"];

  // 2. If header exists, take the first IP (comma-separated list)
  if (forwardedFor) {
    return typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0].trim()
      : forwardedFor[0].trim();
  }

  // 3. Fallback to Express's req.ip
  if (req.ip) return req.ip;

  // 4. Final fallback to legacy connection remoteAddress
  return req.connection?.remoteAddress || "unknown";
};

app.post(baseUrl + "/verify", async (req, res) => {
  const { email, recaptchaToken } = req.body;
  const userIp = req.ip || req.connection.remoteAddress; // Get user's IP
  if (!validator.isEmail(req.body.email)) {
    return res.status(400).json({ success: false, error: 'Invalid email format' });
  }
  console.log("Received form submission:");
  console.log("email:", email);
  console.log("reCAPTCHA Token:", recaptchaToken.slice(-20));
  console.log("User IP:", userIp);

  if (!recaptchaToken) {
    return res
      .status(400)
      .json({ success: false, error: "reCAPTCHA token is missing." });
  }

  // 2. Verify reCAPTCHA token with Google
  try {
    const userIp = getClientIp(req);
    const googleResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null, // No data in the request body, send as URL parameters
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
          remoteip: userIp,
        },
      }
    );

    const { success, "error-codes": errorCodes } = googleResponse.data;

    if (success) {
      console.log(`Successfully validated and received: email=${email}`);
      return res
        .status(200)
        .json({
          success: true,
          message: "Form submitted and reCAPTCHA verified!",
        });
    } else {
      console.error("reCAPTCHA Verification Failed. Error codes:", errorCodes);
      return res.status(403).json({
        success: false,
        error: "reCAPTCHA verification failed. Are you a robot?",
        details: errorCodes || ["unknown_error"],
      });
    }
  } catch (error) {
    console.error(
      "Error during reCAPTCHA verification or backend processing:",
      error.message
    );
    if (error.response) {
      console.error(
        "Google reCAPTCHA API error response:",
        error.response.data
      );
      return res
        .status(500)
        .json({
          success: false,
          error: "Failed to verify reCAPTCHA with Google.",
          details: error.response.data,
        });
    }
    return res
      .status(500)
      .json({
        success: false,
        error: "Internal server error during form submission.",
      });
  }
});

app.listen(PORT, () => {
    console.log(`API service started on port ${PORT}, API base url is ${baseUrl}`);
});