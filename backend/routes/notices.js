const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Notice = require("../models/Notice");
const User = require("../models/User");
const { protect, isApproved, authorizeRoles } = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

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

            // Broadcast Email to all approved students
            let emailPreviewUrl = null;
            try {
                const students = await User.find({ role: "student", status: "approved" });
                if (students.length > 0) {
                    const emails = students.map(s => s.email);
                    
                    const htmlContent = `<div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px; color: #1f2937;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                            <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center; color: white;">
                                <span style="background-color: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">${category} Notice</span>
                                <h1 style="margin: 10px 0 0 0; font-size: 22px; font-weight: 800;">${title}</h1>
                            </div>
                            <div style="padding: 30px; line-height: 1.6;">
                                <p>Hello Student,</p>
                                <p>An official notice has been posted on the IT Department Notice Board:</p>
                                <div style="background-color: #f9fafb; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; font-style: italic; white-space: pre-wrap; color: #4b5563; border-radius: 4px;">
                                    ${content}
                                </div>
                                <p style="font-size: 14px; color: #6b7280;">Posted by: ${req.user.name} (${req.user.role})<br>Date: ${new Date().toLocaleDateString()}</p>
                                <div style="text-align: center; margin: 30px 0 10px 0;">
                                    <a href="http://localhost:3000/login" style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);">View Notice Board</a>
                                </div>
                            </div>
                            <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                                This is an automated notice broadcast from StudyShareHub IT Portal.
                            </div>
                        </div>
                    </div>`;

                    emailPreviewUrl = await sendEmail({
                        email: emails.join(", "),
                        subject: `[Notice Board] New Announcement: ${title}`,
                        html: htmlContent
                    });
                }
            } catch (mailError) {
                console.error("Notice broadcast email failed:", mailError);
            }

            res.status(201).json({
                success: true,
                message: "Notice posted successfully!",
                notice,
                emailPreviewUrl
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
