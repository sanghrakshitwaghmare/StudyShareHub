const mongoose = require("mongoose");

const MagazineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    edition: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    filePath: {
        type: String,
        required: true
    },
    coverImagePath: {
        type: String,
        default: ""
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Magazine", MagazineSchema);
