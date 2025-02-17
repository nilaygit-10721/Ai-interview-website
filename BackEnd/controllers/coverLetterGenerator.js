const CoverLetter = require("../models/CoverLetter"); // New CoverLetter model
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to clean and format cover letter text
const formatCoverLetterText = (text) => {
    return text
        .replace(/\[.*?\]/g, "") // Remove placeholders inside square brackets []
        .replace(/\*/g, "") // Remove asterisks (*)
        .replace(/\n{2,}/g, "\n") // Remove excessive newlines
        .trim();
};

// Function to create a well-formatted PDF for cover letter
const createFormattedCoverLetterPDF = (coverLetterText, outputPath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Clean and format text
        const formattedText = formatCoverLetterText(coverLetterText);
        const lines = formattedText.split("\n");

        lines.forEach((line, index) => {
            line = line.trim();
            if (line === "") {
                doc.moveDown(1); // Add spacing for empty lines
            } else if (line.match(/^\*\*.*\*\*$/)) {
                doc.font("Helvetica-Bold").fontSize(16).text(line.replace(/\*\*/g, ""), { align: "left" });
                doc.moveDown(1);
            } else if (index > 0 && lines[index - 1].match(/^\*\*.*\*\*$/)) {
                doc.font("Helvetica").fontSize(14).text(line, { align: "left", lineGap: 6 });
                doc.moveDown(0.5);
            } else {
                doc.font("Helvetica").fontSize(12).text(line, { align: "left", lineGap: 4 });
            }
        });

        doc.end();
        stream.on("finish", () => resolve(outputPath));
        stream.on("error", (err) => reject(err));
    });
};

// Function to call Gemini API and generate cover letter content
const generateCoverLetterText = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating cover letter:", error);
        throw new Error("Failed to generate cover letter content");
    }
};

// Cover Letter Generator Controller
exports.coverLetterBuilder = async (req, res) => {
    try {
        const { userId, name, email, phone, jobTitle, company, skills, experience, achievements } = req.body;

        // Validate request
        if (!userId || !name || !email || !phone || !jobTitle || !company || !skills || !experience || !achievements) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Construct the dynamic prompt
        const prompt = `
        Generate a **professional and personalized cover letter** for the following candidate applying for a job. **DO NOT** use placeholders like "[Insert Company Name]", "[Write About Your Experience]", or any other vague descriptions. **Only include real, concrete details based on the provided input.**

        **Candidate Name:** ${name}  
        **Candidate Email:** ${email}  
        **Candidate Phone:** ${phone}  

        **Job Title:** ${jobTitle}  
        **Company:** ${company}  

        **Skills:**  
        ${skills.map(skill => `- ${skill}`).join("\n")}  

        **Experience:**  
        ${experience.map(exp => `- ${exp}`).join("\n")}  

        **Achievements:**  
        ${achievements.map(achieve => `- ${achieve}`).join("\n")}

        **Make sure the cover letter follows this structure:**
        - Personalized greeting to the hiring manager
        - A compelling introduction highlighting interest in the job
        - A section connecting candidate’s skills to the job requirements
        - A section showcasing achievements and how they align with the company’s goals
        - A professional closing paragraph with a call to action
        `;

        // Generate formatted cover letter text using Gemini API
        const coverLetterText = await generateCoverLetterText(prompt);

        // Define PDF file path
        const outputDir = "./cover_letters"; // Ensure the "cover_letters" folder exists
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        const outputPath = `${outputDir}/cover_letter_${userId}_${Date.now()}.pdf`;

        // Generate and format PDF
        await createFormattedCoverLetterPDF(coverLetterText, outputPath);

        // Save the cover letter PDF path to the database
        const newCoverLetter = new CoverLetter({
            user: userId,
            pdfPath: outputPath,
        });
        await newCoverLetter.save();

        // Link cover letter to user
        user.coverLetters.push(newCoverLetter._id);
        await user.save();

        // Send the PDF file
        res.download(outputPath, "cover_letter.pdf", (err) => {
            if (err) console.error("Error sending file:", err);
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
};
