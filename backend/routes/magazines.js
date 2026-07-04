const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Magazine = require("../models/Magazine");
const { protect, isApproved, authorizeRoles } = require("../middleware/auth");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/magazines");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration for Magazines
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const prefix = file.fieldname === "pdfFile" ? "mag" : "cover";
        cb(null, `${prefix}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "pdfFile") {
            if (path.extname(file.originalname).toLowerCase() === ".pdf") {
                cb(null, true);
            } else {
                cb(new Error("Magazine file must be a PDF!"));
            }
        } else if (file.fieldname === "coverImage") {
            if (/\.(jpg|jpeg|png)$/i.test(file.originalname)) {
                cb(null, true);
            } else {
                cb(new Error("Cover image must be a JPEG/JPG or PNG!"));
            }
        } else {
            cb(null, true);
        }
    }
});

// @route   POST /api/magazines
// @desc    Upload a magazine (Faculty/Admin only)
// @access  Private (Faculty/Admin only)
router.post("/", protect, isApproved, authorizeRoles("faculty", "admin"), (req, res) => {
    upload.fields([
        { name: "pdfFile", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ])(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            const { title, edition, description } = req.body;

            if (!req.files || !req.files.pdfFile) {
                // Cleanup uploaded cover image if PDF is missing
                if (req.files && req.files.coverImage) {
                    fs.unlinkSync(req.files.coverImage[0].path);
                }
                return res.status(400).json({ success: false, message: "Please upload the magazine PDF file" });
            }

            const pdfPath = `uploads/magazines/${req.files.pdfFile[0].filename}`;
            let coverPath = "";

            if (req.files.coverImage) {
                coverPath = `uploads/magazines/${req.files.coverImage[0].filename}`;
            }

            const magazine = await Magazine.create({
                title,
                edition,
                description,
                filePath: pdfPath,
                coverImagePath: coverPath,
                uploadedBy: req.user._id
            });

            res.status(201).json({
                success: true,
                message: "Magazine uploaded successfully!",
                magazine
            });
        } catch (error) {
            console.error("Upload Magazine Error:", error);
            // Cleanup files
            if (req.files) {
                if (req.files.pdfFile) fs.unlinkSync(req.files.pdfFile[0].path);
                if (req.files.coverImage) fs.unlinkSync(req.files.coverImage[0].path);
            }
            res.status(500).json({ success: false, message: "Server error during magazine upload" });
        }
    });
});

// @route   GET /api/magazines
// @desc    Get all magazines
// @access  Private (Approved users)
router.get("/", protect, isApproved, async (req, res) => {
    try {
        const magazines = await Magazine.find()
            .populate("uploadedBy", "name role")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: magazines.length, magazines });
    } catch (error) {
        console.error("Get Magazines Error:", error);
        res.status(500).json({ success: false, message: "Server error retrieving magazines" });
    }
});

// @route   DELETE /api/magazines/:id
// @desc    Delete a magazine
// @access  Private (Faculty/Admin only)
router.delete("/:id", protect, isApproved, authorizeRoles("faculty", "admin"), async (req, res) => {
    try {
        const magazine = await Magazine.findById(req.params.id);
        if (!magazine) {
            return res.status(404).json({ success: false, message: "Magazine not found" });
        }

        // Delete physical files
        const pdfFullPath = path.join(__dirname, "..", magazine.filePath);
        if (fs.existsSync(pdfFullPath)) {
            fs.unlinkSync(pdfFullPath);
        }

        if (magazine.coverImagePath) {
            const coverFullPath = path.join(__dirname, "..", magazine.coverImagePath);
            if (fs.existsSync(coverFullPath)) {
                fs.unlinkSync(coverFullPath);
            }
        }

        await magazine.deleteOne();
        res.json({ success: true, message: "Magazine deleted successfully!" });
    } catch (error) {
        console.error("Delete Magazine Error:", error);
        res.status(500).json({ success: false, message: "Server error deleting magazine" });
    }
});

module.exports = router;
