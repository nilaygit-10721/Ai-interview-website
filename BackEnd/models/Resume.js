const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Users_data", required: true }, // Reference to user
        pdfPath: { type: String, required: true }, // Stores the file path of the generated PDF
    },
    { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
