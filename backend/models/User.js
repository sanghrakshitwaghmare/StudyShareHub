const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["student", "faculty", "admin"],
        default: "student"
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: function() {
            // Admin and faculty are auto-approved, students start as pending
            return this.role === "student" ? "pending" : "approved";
        }
    },
    rollNo: {
        type: String,
        required: function() { return this.role === "student"; }
    },
    collegeIdNumber: {
        type: String,
        required: function() { return this.role === "student"; }
    },
    idCardPath: {
        type: String,
        required: function() { return this.role === "student"; }
    },
    semester: {
        type: Number,
        required: function() { return this.role === "student"; },
        min: 1,
        max: 8
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
