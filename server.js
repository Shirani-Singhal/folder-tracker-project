const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000; // ✅ Use Render's assigned port
const LOG_FILE = path.join(__dirname, 'visit_logs.txt');

// API to log visits and video actions
app.post('/api/log-visit', (req, res) => {
    const logEntry = JSON.stringify({
        timestamp: new Date().toISOString(),
        visitor: req.body.visitor || 'Unknown',
        action: req.body.action || 'Unknown action',
        video: req.body.video || 'N/A'
    }) + '\n';

    fs.appendFile(LOG_FILE, logEntry, (err) => {
        if (err) {
            console.error('Failed to write log:', err);
        }
    });

    res.sendStatus(200);
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'shared_folder')));

// Fallback to index.html for unknown routes (optional)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'shared_folder', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
