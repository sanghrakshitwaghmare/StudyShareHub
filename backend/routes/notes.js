const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Note = require("../models/Note");
const { protect, isApproved, authorizeRoles } = require("../middleware/auth");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/notes");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration for Notes (PDF only)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `note-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed for notes!"));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: fileFilter
});

// @route   POST /api/notes
// @desc    Upload a note (Students need verification & approval; Faculty/Admin auto-approve notes)
// @access  Private (Approved users)
router.post("/", protect, isApproved, (req, res) => {
    upload.single("noteFile")(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            const { title, subject, semester, unit, description } = req.body;

            if (!req.file) {
                return res.status(400).json({ success: false, message: "Please upload a PDF file for notes" });
            }

            // Faculty and Admin notes are auto-approved. Student notes start as pending.
            const noteStatus = (req.user.role === "faculty" || req.user.role === "admin") ? "approved" : "pending";

            const newNote = await Note.create({
                title,
                subject,
                semester: parseInt(semester),
                unit,
                description,
                filePath: `uploads/notes/${req.file.filename}`,
                uploadedBy: req.user._id,
                status: noteStatus
            });

            res.status(201).json({
                success: true,
                message: noteStatus === "approved" 
                    ? "Note uploaded and published successfully!" 
                    : "Note uploaded successfully! It is pending approval by faculty/admin.",
                note: newNote
            });
        } catch (error) {
            console.error("Upload Note Error:", error);
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ success: false, message: "Server error during note upload" });
        }
    });
});

// @route   GET /api/notes
// @desc    Get all approved notes (with search & filter options)
// @access  Private (Approved users)
router.get("/", protect, isApproved, async (req, res) => {
    try {
        const { semester, subject, search } = req.query;
        let query = { status: "approved" };

        if (semester) {
            query.semester = parseInt(semester);
        }

        if (subject) {
            query.subject = { $regex: subject, $options: "i" };
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } }
            ];
        }

        const notes = await Note.find(query)
            .populate("uploadedBy", "name role")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: notes.length, notes });
    } catch (error) {
        console.error("Get Notes Error:", error);
        res.status(500).json({ success: false, message: "Server error retrieving notes" });
    }
});

// @route   GET /api/notes/pending
// @desc    Get all pending notes for review
// @access  Private (Faculty/Admin only)
router.get("/pending", protect, isApproved, authorizeRoles("faculty", "admin"), async (req, res) => {
    try {
        const notes = await Note.find({ status: "pending" })
            .populate("uploadedBy", "name rollNo semester email")
            .sort({ createdAt: -1 });
            
        res.json({ success: true, count: notes.length, notes });
    } catch (error) {
        console.error("Get Pending Notes Error:", error);
        res.status(500).json({ success: false, message: "Server error retrieving pending notes" });
    }
});

// @route   PUT /api/notes/:id/approve
// @desc    Approve a pending note
// @access  Private (Faculty/Admin only)
router.put("/:id/approve", protect, isApproved, authorizeRoles("faculty", "admin"), async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }

        note.status = "approved";
        await note.save();

        res.json({ success: true, message: "Note approved successfully!", note });
    } catch (error) {
        console.error("Approve Note Error:", error);
        res.status(500).json({ success: false, message: "Server error approving note" });
    }
});

// @route   POST /api/notes/:id/download
// @desc    Increment the download count of a note
// @access  Private (Approved users)
router.post("/:id/download", protect, isApproved, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }

        note.downloadsCount += 1;
        await note.save();

        res.json({ success: true, downloadsCount: note.downloadsCount });
    } catch (error) {
        console.error("Increment Download Error:", error);
        res.status(500).json({ success: false, message: "Server error tracking download" });
    }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private (Uploader or Faculty/Admin)
router.delete("/:id", protect, isApproved, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }

        // Check ownership: only uploader or admin/faculty can delete
        const isOwner = note.uploadedBy.toString() === req.user._id.toString();
        const isAuthorized = req.user.role === "faculty" || req.user.role === "admin";

        if (!isOwner && !isAuthorized) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this note" });
        }

        // Delete physical file
        const fullPath = path.join(__dirname, "..", note.filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        await note.deleteOne();
        res.json({ success: true, message: "Note deleted successfully!" });
    } catch (error) {
        console.error("Delete Note Error:", error);
        res.status(500).json({ success: false, message: "Server error deleting note" });
    }
});

module.exports = router;
