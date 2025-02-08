"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const fetchUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).json({ error: 'Please authenticate using a valid token' });
        return;
    }
    console.log('Received Token:', token); // Log the token received
    try {
        const data = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = data.user;
        console.log('User extracted from token:', req.user); // Log to check user data
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error); // Log the error
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
};
exports.default = fetchUser;
