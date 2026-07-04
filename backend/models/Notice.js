const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ["Academic", "Exam", "Event", "Placement", "Other"],
        default: "Academic"
    },
    filePath: {
        type: String,
        default: ""
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Notice", NoticeSchema);
