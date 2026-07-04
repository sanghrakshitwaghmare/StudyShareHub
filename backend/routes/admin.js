const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Note = require("../models/Note");
const Notice = require("../models/Notice");
const Magazine = require("../models/Magazine");
const { protect, isApproved, authorizeRoles } = require("../middleware/auth");

// All admin routes require being logged in, approved, and holding the role of Admin (or Faculty for review)
router.use(protect);
router.use(isApproved);
router.use(authorizeRoles("admin", "faculty"));

// @route   GET /api/admin/users/pending
// @desc    Get all students pending ID card verification
// @access  Private (Admin/Faculty)
router.get("/users/pending", async (req, res) => {
    try {
        const pendingStudents = await User.find({ role: "student", status: "pending" })
            .sort({ createdAt: -1 });

        res.json({ success: true, count: pendingStudents.length, users: pendingStudents });
    } catch (error) {
        console.error("Get Pending Students Error:", error);
        res.status(500).json({ success: false, message: "Server error retrieving verification queue" });
    }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify (Approve/Reject) student registration
// @access  Private (Admin/Faculty)
router.put("/users/:id/verify", async (req, res) => {
    try {
        const { status } = req.body; // "approved" or "rejected"
        
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
        }

        const student = await User.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        if (student.role !== "student") {
            return res.status(400).json({ success: false, message: "Only student roles can be verified" });
        }

        student.status = status;
        await student.save();

        res.json({ 
            success: true, 
            message: `Student account registration has been ${status} successfully.`,
            user: student
        });
    } catch (error) {
        console.error("Verify Student Error:", error);
        res.status(500).json({ success: false, message: "Server error updating verification status" });
    }
});

// @route   GET /api/admin/users
// @desc    Get all registered users and manage roles
// @access  Private (Admin/Faculty)
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ success: false, message: "Server error retrieving users list" });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role (Only Admin can change roles)
// @access  Private (Admin only)
router.put("/users/:id/role", authorizeRoles("admin"), async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!["student", "faculty", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role specified" });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.role = role;
        // If promoting to faculty or admin, automatically set status to approved if it was pending
        if (role !== "student") {
            user.status = "approved";
        }
        await user.save();

        res.json({ success: true, message: `User role updated to ${role} successfully.`, user });
    } catch (error) {
        console.error("Change Role Error:", error);
        res.status(500).json({ success: false, message: "Server error updating user role" });
    }
});

// @route   GET /api/admin/stats
// @desc    Get counts and metrics for the admin dashboard
// @access  Private (Admin/Faculty)
router.get("/stats", async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: "student" });
        const approvedStudents = await User.countDocuments({ role: "student", status: "approved" });
        const pendingStudents = await User.countDocuments({ role: "student", status: "pending" });
        const totalFaculty = await User.countDocuments({ role: "faculty" });

        const approvedNotes = await Note.countDocuments({ status: "approved" });
        const pendingNotes = await Note.countDocuments({ status: "pending" });
        const totalNotices = await Notice.countDocuments();
        const totalMagazines = await Magazine.countDocuments();

        // Calculate total downloads
        const notes = await Note.find({}, "downloadsCount");
        const totalDownloads = notes.reduce((acc, note) => acc + (note.downloadsCount || 0), 0);

        res.json({
            success: true,
            stats: {
                users: {
                    totalStudents,
                    approvedStudents,
                    pendingStudents,
                    totalFaculty
                },
                content: {
                    approvedNotes,
                    pendingNotes,
                    totalNotices,
                    totalMagazines
                },
                activity: {
                    totalDownloads
                }
            }
        });
    } catch (error) {
        console.error("Get Portal Stats Error:", error);
        res.status(500).json({ success: false, message: "Server error retrieving stats" });
    }
});

module.exports = router;
