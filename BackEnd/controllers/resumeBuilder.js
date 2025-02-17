const Resume = require("../models/Resume");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to clean and format resume text properly
// Function to clean and format resume text properly
const formatResumeText = (text) => {
    return text
        .replace(/\[.*?\]/g, "") // Remove all text inside square brackets []
        .replace(/\*/g, "") // Remove asterisks (*)
        .replace(/\n{2,}/g, "\n") // Remove excessive newlines
        .trim();
};


// Function to create a well-formatted PDF
const createFormattedResumePDF = (resumeText, outputPath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Clean and format text (removing placeholders)
        const formattedText = formatResumeText(resumeText);

        // Split text into lines for better formatting
        const lines = formattedText.split("\n");

        lines.forEach((line, index) => {
            line = line.trim(); // Remove leading/trailing spaces

            if (line === "") {
                doc.moveDown(1); // Add spacing for empty lines
            } else if (line.match(/^\*\*.*\*\*$/)) { 
                // If line is a heading (**Bold Text**), format it properly
                doc.font("Helvetica-Bold").fontSize(16).text(line.replace(/\*\*/g, ""), { align: "left" }); 
                doc.moveDown(0.5);
            } else if (index > 0 && lines[index - 1].match(/^\*\*.*\*\*$/)) { 
                // If it's right after a heading, format it as a subheading
                doc.font("Helvetica").fontSize(14).text(line, { align: "left", lineGap: 6 }); 
                doc.moveDown(0.5);
            } else {
                // Normal body text
                doc.font("Helvetica").fontSize(12).text(line, { align: "left", lineGap: 4 });
            }
        });

        doc.end();
        stream.on("finish", () => resolve(outputPath));
        stream.on("error", (err) => reject(err));
    });
};




// Function to call Gemini API and generate resume content
const generateResumeText = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating resume:", error);
        throw new Error("Failed to generate resume content");
    }
};

// Function to create ATS-friendly PDF
const createResumePDF = (resumeText, outputPath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Title
        doc.fontSize(18).text("ATS-Friendly Resume", { align: "center" });
        doc.moveDown(1);

        // Resume Content
        doc.font("Helvetica").fontSize(12).text(resumeText, { align: "left", lineGap: 4 });

        doc.end();
        stream.on("finish", () => resolve(outputPath));
        stream.on("error", (err) => reject(err));
    });
};
exports.resumeBuilder = async (req, res) => {
    try {
        const { userId, name, email, phone, skills, languages, projects, education, experience, achievements } = req.body;

        // Validate request
        if (!userId || !name || !email || !skills || !languages || !projects || !education || !experience || !achievements) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Construct the dynamic prompt
        const prompt = `
        Generate a **fully detailed and ATS-friendly resume** for the following candidate. **DO NOT** use placeholders like "[Brief Description]", "[Add link to project]", "[Quantifiable Achievement]", "[Specific technologies]", or any other vague descriptions. **Only include real, concrete details based on the provided input.**

        **Name:** ${name}  
        **Email:** ${email}  
        **Phone:** ${phone}  

        **Skills:**  
        ${skills.map(skill => `- ${skill}`).join("\n")}  

        **Languages:**  
        ${languages.map(lang => `- ${lang}`).join("\n")}  

        **Projects:**  
        ${projects.map(project => `- ${project}`).join("\n")}  

        **Education:**  
        ${education.map(edu => `- ${edu}`).join("\n")}  

        **Experience:**  
        ${experience.map(exp => `- ${exp}`).join("\n")}  

        **Achievements & Certifications:**  
        ${achievements.map(achieve => `- ${achieve}`).join("\n")}
        `;

        // Generate formatted resume text using Gemini API
        const resumeText = await generateResumeText(prompt);
        // console.log("Generated Resume Text:", resumeText);

        // Define PDF file path
        const outputDir = "./resumes"; // Ensure the "resumes" folder exists
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        const outputPath = `${outputDir}/resume_${userId}_${Date.now()}.pdf`;

        // Generate and format PDF
        await createFormattedResumePDF(resumeText, outputPath);

        // Save the resume PDF path to the database
        const newResume = new Resume({
            user: userId,
            pdfPath: outputPath,
        });
        await newResume.save();

        // Link resume to user
        user.resumes.push(newResume._id);
        await user.save();

        // Send the PDF file
        res.download(outputPath, "resume.pdf", (err) => {
            if (err) console.error("Error sending file:", err);
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
};
