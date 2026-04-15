// Force Node to use Google DNS
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

(async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            family: 4
        });
        console.log('✅ MongoDB connected');

        const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !password) throw new Error('Set ADMIN_EMAIL & ADMIN_PASSWORD in .env');

        const existing = await Admin.findOne({ email });
        if (existing) {
            console.log(`ℹ️  Admin already exists: ${email}`);
        } else {
            await Admin.create({ email, password, name: 'Vinodha Admin' });
            console.log(`✅ Admin created: ${email}`);
            console.log(`   Password: ${password}  (change after first login)`);
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
})();