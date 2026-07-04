const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token and attach user to request
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

            // Get user from token
            req.user = await User.findById(decoded.id).select("-password");
            
            if (!req.user) {
                return res.status(401).json({ success: false, message: "User not found with this token" });
            }

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            return res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }
};

// Check if user is approved (ID verified)
const isApproved = (req, res, next) => {
    if (req.user && req.user.status === "approved") {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: `Access denied. Your registration status is: ${req.user ? req.user.status : "unknown"}`
        });
    }
};

// Restrict access to specific roles (e.g., admin, faculty)
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user.role}) is not authorized to access this resource`
            });
        }
        next();
    };
};

module.exports = { protect, isApproved, authorizeRoles };
