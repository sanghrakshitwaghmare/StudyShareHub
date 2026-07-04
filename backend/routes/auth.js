const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/id_cards");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration for ID Cards
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `id-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only images (jpeg, jpg, png) are allowed for college ID cards!"));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// @route   POST /api/auth/register
// @desc    Register a new user (student uploads ID card, faculty/admin auto-approved)
// @access  Public
router.post("/register", (req, res) => {
    // We use a custom multer handler to catch errors (like file type errors) gracefully
    upload.single("idCard")(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            const { name, email, password, role, rollNo, collegeIdNumber, semester } = req.body;

            // Check if user already exists
            const userExists = await User.findOne({ email });
            if (userExists) {
                // If a file was uploaded, clean it up since registration failed
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ success: false, message: "User with this email already exists" });
            }

            let userData = {
                name,
                email,
                password,
                role: role || "student"
            };

            if (userData.role === "student") {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: "College ID card image upload is required for student registration"
                    });
                }
                userData.rollNo = rollNo;
                userData.collegeIdNumber = collegeIdNumber;
                userData.semester = semester;
                // Save relative path for easy serving
                userData.idCardPath = `uploads/id_cards/${req.file.filename}`;
            }

            const user = await User.create(userData);

            res.status(201).json({
                success: true,
                message: user.role === "student" 
                    ? "Registration successful! Your verification is pending admin review." 
                    : "Registration successful!",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            });
        } catch (error) {
            console.error("Register Error:", error);
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ success: false, message: "Server error during registration" });
        }
    });
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Return token & user details
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "your_secret_key",
            { expiresIn: "30d" }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                semester: user.semester
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching user details" });
    }
});

module.exports = router;
