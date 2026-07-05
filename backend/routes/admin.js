const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Note = require("../models/Note");
const Notice = require("../models/Notice");
const Magazine = require("../models/Magazine");
const { protect, isApproved, authorizeRoles } = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

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

        // Send Email Notification
        let emailPreviewUrl = null;
        try {
            const isApproved = status === "approved";
            const subject = isApproved 
                ? "StudyShareHub - Your Account Registration has been Approved!"
                : "StudyShareHub - Account Verification Status Update";
            
            const htmlContent = isApproved
                ? `<div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px; color: #1f2937;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                        <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Registration Approved!</h1>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">Welcome to the IT Student Portal</p>
                        </div>
                        <div style="padding: 30px; line-height: 1.6;">
                            <p>Dear <strong>${student.name}</strong>,</p>
                            <p>We are pleased to inform you that your registration for the IT Department Student Portal (StudyShareHub) has been reviewed and <strong>Approved</strong> by the administrator desk.</p>
                            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                <p style="margin: 0 0 8px 0;"><strong>Student Details:</strong></p>
                                <p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;">Roll Number: ${student.rollNo}</p>
                                <p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;">College ID Ref: ${student.collegeIdNumber}</p>
                                <p style="margin: 0; font-size: 14px; color: #4b5563;">Semester: Semester ${student.semester}</p>
                            </div>
                            <p>You can now log in to the portal using your registered email: <strong>${student.email}</strong>.</p>
                            <div style="text-align: center; margin: 30px 0 10px 0;">
                                <a href="http://localhost:3000/login" style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);">Log In to Portal</a>
                            </div>
                        </div>
                        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                            &copy; ${new Date().getFullYear()} StudyShareHub IT Department Portal. All rights reserved.
                        </div>
                    </div>
                </div>`
                : `<div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px; color: #1f2937;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #f43f5e; padding: 30px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Registration Rejected</h1>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">IT Department Student Portal Update</p>
                        </div>
                        <div style="padding: 30px; line-height: 1.6;">
                            <p>Dear <strong>${student.name}</strong>,</p>
                            <p>We regret to inform you that your registration request for the IT Department Student Portal (StudyShareHub) has been <strong>Rejected</strong> following our College ID card verification check.</p>
                            <p style="color: #4b5563;">This typically occurs if the uploaded ID card image was blurry, illegible, did not match the provided registration details, or was invalid.</p>
                            <p>Please re-register with a clear, high-resolution scan of your official College ID card, or contact your faculty advisor for manual verification.</p>
                        </div>
                        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                            &copy; ${new Date().getFullYear()} StudyShareHub IT Department Portal. All rights reserved.
                        </div>
                    </div>
                </div>`;
                
            emailPreviewUrl = await sendEmail({
                email: student.email,
                subject: subject,
                html: htmlContent
            });
        } catch (mailError) {
            console.error("Verification email dispatch failed:", mailError);
        }

        res.json({ 
            success: true, 
            message: `Student account registration has been ${status} successfully.`,
            user: student,
            emailPreviewUrl
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
