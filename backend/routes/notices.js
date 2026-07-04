const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Notice = require("../models/Notice");
const { protect, isApproved, authorizeRoles } = require("../middleware/auth");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/notices");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration for Notices (PDF/doc/images)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `notice-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   POST /api/notices
// @desc    Post a notice
// @access  Private (Faculty/Admin only)
router.post("/", protect, isApproved, authorizeRoles("faculty", "admin"), (req, res) => {
    upload.single("attachment")(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            const { title, content, category } = req.body;
            let filePath = "";

            if (req.file) {
                filePath = `uploads/notices/${req.file.filename}`;
            }

            const notice = await Notice.create({
                title,
                content,
                category,
                filePath,
                postedBy: req.user._id
            });

            res.status(201).json({
                success: true,
                message: "Notice posted successfully!",
                notice
            });
        } catch (error) {
            console.error("Post Notice Error:", error);
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ success: false, message: "Server error posting notice" });
        }
    });
});

// @route   GET /api/notices
// @desc    Get all notices
// @access  Private (Approved users)
router.get("/", protect, isApproved, async (req, res) => {
    try {
        const notices = await Notice.find()
            .populate("postedBy", "name role")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: notices.length, notices });
    } catch (error) {
        console.error("Get Notices Error:", error);
        res.status(500).json({ success: false, message: "Server error retrieving notices" });
    }
});

// @route   DELETE /api/notices/:id
// @desc    Delete a notice
// @access  Private (Faculty/Admin only)
router.delete("/:id", protect, isApproved, authorizeRoles("faculty", "admin"), async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice not found" });
        }

        // Delete attachment if exists
        if (notice.filePath) {
            const fullPath = path.join(__dirname, "..", notice.filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        await notice.deleteOne();
        res.json({ success: true, message: "Notice deleted successfully!" });
    } catch (error) {
        console.error("Delete Notice Error:", error);
        res.status(500).json({ success: false, message: "Server error deleting notice" });
    }
});

module.exports = router;
