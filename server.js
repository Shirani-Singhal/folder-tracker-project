const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = 3000;
const LOG_FILE = 'visit_logs.txt';

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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
