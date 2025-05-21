const Resume = require("../models/Resume");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

exports.downloadUserResume = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user and populate resume references
    const user = await User.findById(userId).populate("resumes");
    if (!user || !user.resumes.length) {
      return res
        .status(404)
        .json({ message: "No resumes found for this user" });
    }

    // Get the latest resume (assuming newest is last in array)
    const latestResume = user.resumes[user.resumes.length - 1];

    const filePath = latestResume.pdfPath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Resume file not found on server" });
    }

    res.download(filePath, `resume_${userId}.pdf`, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).send("Could not download resume.");
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
