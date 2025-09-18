const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

const PORT = process.env.PORT || 3000;
const LOG_FILE = 'visit_logs.txt';
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Dummy users (hashed passwords)
const users = [
    {
        username: "dhani",
        password: bcrypt.hashSync("dhani123", 10) // hash of 'alice123'
    },
    {
        username: "bob",
        password: bcrypt.hashSync("bob456", 10) // hash of 'bob456'
    }
];

// ✅ Login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ success: true, token });
});

// ✅ Middleware to protect API routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ✅ Open endpoint (no auth) — for public clients
app.post('/api/log-visit', (req, res) => {
    const data = {
        timestamp: new Date().toISOString(),
        ...req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        user: "guest"
    };

    logAndBroadcast(data);
    res.sendStatus(200);
});

// ✅ Protected endpoint (auth required) — for managers/admins
app.post('/api/log-visit-protected', authenticateToken, (req, res) => {
    const data = {
        timestamp: new Date().toISOString(),
        ...req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        user: req.user.username
    };

    logAndBroadcast(data);
    res.sendStatus(200);
});

// ✅ Common function for logging & broadcasting
function logAndBroadcast(data) {
    const logEntry = JSON.stringify(data) + '\n';
    fs.appendFileSync(LOG_FILE, logEntry);
    io.emit("new_visit", data);
}

// ✅ WebSocket connection
io.on("connection", (socket) => {
    console.log("✅ Manager or client connected to WebSocket");

    socket.on("visit_event", (data) => {
        console.log("📥 Visit Event:", data);
        io.emit("new_visit", data);
    });

    socket.on("disconnect", () => {
        console.log("❌ A WebSocket client disconnected");
    });
});

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, 'shared_folder')));

server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
