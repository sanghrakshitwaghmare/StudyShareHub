const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Models
const User = require("./models/User");
const Note = require("./models/Note");
const Notice = require("./models/Notice");
const Magazine = require("./models/Magazine");

dotenv.config();

// Ensure upload folders exist
const uploadFolders = [
    "uploads/id_cards",
    "uploads/notes",
    "uploads/notices",
    "uploads/magazines"
];
uploadFolders.forEach(folder => {
    const dir = path.join(__dirname, folder);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Write Mock Files
// 1. Tiny 1x1 transparent PNG for College ID Card & Cover Image
const pixelPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const pngBuffer = Buffer.from(pixelPngBase64, "base64");

fs.writeFileSync(path.join(__dirname, "uploads/id_cards/sample-id.png"), pngBuffer);
fs.writeFileSync(path.join(__dirname, "uploads/magazines/mag-cover.png"), pngBuffer);

// 2. Placeholder text files representing PDF downloads
fs.writeFileSync(path.join(__dirname, "uploads/notes/note-sample.pdf"), "%PDF-1.4 Mock study note content file...");
fs.writeFileSync(path.join(__dirname, "uploads/notices/syllabus-changes.pdf"), "%PDF-1.4 Mock syllabus attachment...");
fs.writeFileSync(path.join(__dirname, "uploads/magazines/annual-2026.pdf"), "%PDF-1.4 Mock departmental magazine content...");

const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB for seeding...");
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/StudyShareHub", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Clearing existing collection records...");
        await User.deleteMany();
        await Note.deleteMany();
        await Notice.deleteMany();
        await Magazine.deleteMany();

        console.log("Seeding Users...");
        
        // 1. Admin
        const adminUser = await User.create({
            name: "Admin Portal Desk",
            email: "admin@it.edu",
            password: "adminpassword",
            role: "admin",
            status: "approved"
        });

        // 2. Faculty
        const facultyUser = await User.create({
            name: "Dr. Sarah Jenkins",
            email: "sarah.jenkins@it.edu",
            password: "facultypassword",
            role: "faculty",
            status: "approved"
        });

        // 3. Student (Verified & Approved)
        const studentVerified = await User.create({
            name: "Rahul Verma",
            email: "rahul.verma@student.edu",
            password: "studentpassword",
            role: "student",
            status: "approved",
            rollNo: "IT-2026-004",
            collegeIdNumber: "COL-123456",
            semester: 6,
            idCardPath: "uploads/id_cards/sample-id.png"
        });

        // 4. Student (Pending Verification)
        const studentPending = await User.create({
            name: "Sanghrakshit Waghmare",
            email: "sanghrakshit.s@student.edu",
            password: "studentpassword",
            role: "student",
            status: "pending",
            rollNo: "T52042",
            collegeIdNumber: "123E10659",
            semester: 6,
            idCardPath: "uploads/id_cards/sample-id.png"
        });

        console.log("Seeding Study Notes...");
        
        // Note by Faculty (Approved)
        await Note.create({
            title: "Database Management Systems - Indexing & Hashing",
            subject: "DBMS",
            semester: 5,
            unit: "Unit 4",
            filePath: "uploads/notes/note-sample.pdf",
            description: "Detailed slides covering dense/sparse indexes, B+ Trees, and static/dynamic hashing structures.",
            uploadedBy: facultyUser._id,
            status: "approved",
            downloadsCount: 14
        });

        // Note by Faculty 2 (Approved)
        await Note.create({
            title: "Operating Systems - Process Scheduling Algorithms",
            subject: "Operating Systems",
            semester: 4,
            unit: "Unit 2",
            filePath: "uploads/notes/note-sample.pdf",
            description: "SJF, Round Robin, SRTF and Multi-level Queue scheduling examples with Gantt chart solutions.",
            uploadedBy: facultyUser._id,
            status: "approved",
            downloadsCount: 29
        });

        // Note by Student (Pending Approval)
        await Note.create({
            title: "Computer Networks - Socket Programming Lab Code",
            subject: "Computer Networks",
            semester: 6,
            unit: "Lab Manual",
            filePath: "uploads/notes/note-sample.pdf",
            description: "TCP and UDP client-server implementation scripts in Java/C++.",
            uploadedBy: studentVerified._id,
            status: "pending",
            downloadsCount: 0
        });

        console.log("Seeding Notices...");

        // Notice 1
        await Notice.create({
            title: "Postponement of DBMS Lab Mid-Term Exam",
            content: "Please note that the DBMS Laboratory mid-semester examination scheduled for Monday (6th July) has been postponed to Thursday (9th July) due to the university guest lecture. Report at Lab 4 at 10:00 AM.",
            category: "Exam",
            filePath: "uploads/notices/syllabus-changes.pdf",
            postedBy: facultyUser._id
        });

        // Notice 2
        await Notice.create({
            title: "Placement Drive - Google Software Engineer Interns",
            content: "Applications are open for Google SE Internships (2027 batch). IT Department students with a CGPA above 8.5 and no active backlogs are eligible to apply. Submit your resume PDF via the placement link by Friday.",
            category: "Placement",
            filePath: "",
            postedBy: adminUser._id
        });

        console.log("Seeding Magazines...");

        // Magazine
        await Magazine.create({
            title: "IT Innovators Newsletter",
            edition: "Spring 2026 - Vol. 1",
            description: "Read about student projects in Web3, Generative AI research papers by IT department faculty, and the tech highlights of the annual coding hackathon.",
            filePath: "uploads/magazines/annual-2026.pdf",
            coverImagePath: "uploads/magazines/mag-cover.png",
            uploadedBy: adminUser._id
        });

        console.log("Database seeded successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedDatabase();
