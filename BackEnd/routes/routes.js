const express = require("express");
const router = express.Router();
const { login, signup } = require("../controllers/auth");
const { resumeBuilder } = require("../controllers/resumeBuilder");
const { coverLetterBuilder } = require("../controllers/coverLetterGenerator");
const { interview, voiceToText } = require("../controllers/interview");
const { quiz } = require("../controllers/quiz");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/coverLetterBuilder", coverLetterBuilder);
router.post("/login", login);
router.post("/signup", signup);
router.post("/resumeBuilder", resumeBuilder);
router.post("/interview", interview);
router.post("/transcribe", ...voiceToText);
router.post("/generate-quiz", quiz);
module.exports = router;
