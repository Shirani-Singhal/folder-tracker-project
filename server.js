const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

const PORT = process.env.PORT || 3000;
const LOG_FILE = 'visit_logs.txt';

// API to log visits
app.post('/api/log-visit', (req, res) => {
    const data = {
        timestamp: new Date().toISOString(),
        ...req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    };

    const logEntry = JSON.stringify(data) + '\n';
    fs.appendFileSync(LOG_FILE, logEntry);

    // Broadcast real-time event to manager
    io.emit("new_visit", data);

    res.sendStatus(200);
});

// WebSocket connection
io.on("connection", (socket) => {
    console.log("✅ Manager or client connected to WebSocket");

    socket.on("visit_event", (data) => {
        console.log("📥 Visit Event:", data);
        io.emit("new_visit", data); // Broadcast to manager(s)
    });

    socket.on("disconnect", () => {
        console.log("❌ A WebSocket client disconnected");
    });
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'shared_folder')));

server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
