// server.js — Vinodha Estates (deployment-ready single server)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ---------- Middleware ----------
app.use(cors());                          // allow API to be called from anywhere
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------- Static files ----------
// Public website (index.html, script.js, styles.css)
app.use(express.static(path.join(__dirname, 'public')));
// Uploaded property images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- API Routes ----------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));

// API health check
app.get('/api', (req, res) => res.json({ ok: true, service: 'Vinodha Estates API' }));

// ---------- Friendly admin URLs ----------
app.get('/admin', (req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'))
);
app.get('/admin/dashboard', (req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'))
);

// ---------- 404 fallback for unknown routes -> homepage ----------
app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- DB + Start ----------
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    family: 4
})
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () =>
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        );
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
