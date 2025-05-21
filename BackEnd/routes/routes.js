const express = require("express");
const router = express.Router();
const { login, signup } = require("../controllers/auth");
const { resumeBuilder } = require("../controllers/resumeBuilder");
const { coverLetterBuilder } = require("../controllers/coverLetterGenerator");
const { interview, voiceToText } = require("../controllers/interview");
const { getUserProfile } = require("../controllers/userController");
const { quiz } = require("../controllers/quiz");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { authMiddleware } = require("../controllers/auth");
const { downloadUserResume } = require("../controllers/resumeDownload");

router.post("/coverLetterBuilder", coverLetterBuilder);
router.post("/login", login);
router.post("/signup", signup);
router.post("/resumeBuilder", resumeBuilder);
router.post("/interview", interview);
router.post("/transcribe", ...voiceToText);
router.post("/generate-quiz", quiz);
router.get("/profile", authMiddleware, getUserProfile);

router.get("/download/:userId", downloadUserResume);

module.exports = router;
