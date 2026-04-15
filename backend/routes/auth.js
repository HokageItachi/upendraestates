const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

module.exports = async function protect(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized – no token' });
    }
    try {
        const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
        req.admin = await Admin.findById(decoded.id).select('-password');
        if (!req.admin) return res.status(401).json({ message: 'Admin not found' });
        next();
    } catch {
        res.status(401).json({ message: 'Token invalid or expired' });
    }
};
