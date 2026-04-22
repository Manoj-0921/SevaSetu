const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ msg: 'User not found, authorization denied' });
            }
            next();
        } catch (error) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }
    } else {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ msg: 'Access denied: Admins only' });
    }
};

const isDoctor = (req, res, next) => {
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({ msg: 'Access denied: Doctors only' });
    }
};

module.exports = { protect, isAdmin, isDoctor };
