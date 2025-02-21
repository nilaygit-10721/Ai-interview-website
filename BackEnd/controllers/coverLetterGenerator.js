const CoverLetter = require("../models/CoverLetter");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const latex = require("node-latex");
require("dotenv").config();

// Function to create a LaTeX cover letter template
const generateLatexCoverLetter = ({ 
    name, 
    email, 
    phone, 
    streetAddress,
    city,
    postalCode,
    jobTitle, 
    company,
    companyAddress,
    companyCity,
    companyPostalCode,
    date,
    attachments,
    content
}) => {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Escape special LaTeX characters in content
    const escapedContent = content.replace(/([&%$#_{}])/g, '\\$1');

    return `\\documentclass[11pt,a4paper]{letter}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{hyperref}

\\geometry{
    left=1.25in,
    right=1.25in,
    top=1.25in,
    bottom=1.25in
}

\\begin{document}

\\begin{letter}{${company}\\\\
${companyAddress}\\\\
${companyCity}, ${companyPostalCode}}

\\address{${name}\\\\
${streetAddress}\\\\
${city}, ${postalCode}\\\\
${phone}\\\\
${email}}

\\date{${date || today}}

\\opening{Dear Hiring Manager,}

${escapedContent}

\\vspace{\\baselineskip}
\\noindent
${attachments ? `\\vspace{\\baselineskip}\\noindent Attachments: ${attachments}` : ''}

\\closing{Sincerely,}

\\vspace{0.5in}
${name}

\\end{letter}
\\end{document}`;
};

// Cover Letter Generator Controller
exports.coverLetterBuilder = async (req, res) => {
    try {
        const { 
            userId, 
            name, 
            email, 
            phone, 
            streetAddress,
            city,
            postalCode,
            jobTitle, 
            company,
            companyAddress,
            companyCity,
            companyPostalCode,
            date,
            attachments,
            content 
        } = req.body;

        // Validate request
        if (!userId || !name || !email || !phone || !jobTitle || !company || !content) {
            return res.status(400).json({ error: "Required fields are missing" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate LaTeX cover letter content
        const latexContent = generateLatexCoverLetter({ 
            name, 
            email, 
            phone, 
            streetAddress,
            city,
            postalCode,
            jobTitle, 
            company,
            companyAddress,
            companyCity,
            companyPostalCode,
            date,
            attachments,
            content
        });
        
        // Define LaTeX debug file path
        const debugDir = path.join(__dirname, "debug");
        await fs.promises.mkdir(debugDir, { recursive: true });
        const debugFilePath = path.join(debugDir, `cover_letter_${userId}_debug.tex`);
        await fs.promises.writeFile(debugFilePath, latexContent);

        // Generate PDF
        const outputDir = path.join(__dirname, "cover_letters");
        await fs.promises.mkdir(outputDir, { recursive: true });
        const outputPath = path.join(outputDir, `cover_letter_${userId}_${Date.now()}.pdf`);

        // Options for node-latex
        const options = {
            cmd: 'pdflatex',
            inputs: debugDir,
            passes: 2
        };

        // Convert LaTeX to PDF
        const pdfStream = latex(latexContent, options);
        const output = fs.createWriteStream(outputPath);
        
        pdfStream.pipe(output);

        await new Promise((resolve, reject) => {
            output.on('finish', resolve);
            output.on('error', reject);
            pdfStream.on('error', reject);
        });

        // Save to database and send response
        const newCoverLetter = new CoverLetter({ user: userId, pdfPath: outputPath });
        await newCoverLetter.save();
        user.coverLetters.push(newCoverLetter._id);
        await user.save();
        
        res.download(outputPath, "cover_letter.pdf");

    } catch (error) {
        console.error("Error:", error);
        
        // Check if the error is from LaTeX compilation
        if (error.message.includes('LaTeX')) {
            const errorLogPath = path.join(__dirname, 'debug', 'latex_errors.log');
            try {
                const errorLog = await fs.promises.readFile(errorLogPath, 'utf8');
                return res.status(500).json({ 
                    error: "Failed to generate PDF", 
                    details: errorLog.split('\n').filter(line => line.startsWith('!')).join('\n')
                });
            } catch (readError) {
                console.error("Could not read LaTeX error log:", readError);
            }
        }
        
        res.status(500).json({ error: "Failed to generate PDF", details: error.message });
    }
};