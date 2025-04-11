const CoverLetter = require("../models/CoverLetter");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const latex = require("node-latex");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Enhanced LaTeX escaping function - Modified to not auto-replace newlines
const escapeLaTeX = (str) => {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\textbackslash ")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde ")
    .replace(/\^/g, "\\textasciicircum ");
  // Removed: .replace(/\n/g, "\\\\\n");
};

// Process content specifically to handle paragraphs and line breaks properly
const formatContent = (content) => {
  if (!content) return "";
  // First escape LaTeX special characters
  let escaped = escapeLaTeX(content);

  // Then handle paragraphs and line breaks
  return escaped
    .split("\n\n") // Split on paragraph breaks (double newlines)
    .map((para) => para.replace(/\n/g, " \\\\ ")) // Replace single newlines with LaTeX line breaks
    .join("\n\n"); // Join with paragraph breaks
};

// Improved LaTeX template generator
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
  content,
}) => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `\\documentclass[11pt,a4paper]{letter}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage[colorlinks=true]{hyperref}

\\geometry{
    left=1.25in,
    right=1.25in,
    top=1.25in,
    bottom=1.25in
}

\\begin{document}

\\begin{letter}{${escapeLaTeX(company)}\\\\
${escapeLaTeX(companyAddress)}\\\\
${escapeLaTeX(companyCity)}, ${escapeLaTeX(companyPostalCode)}}

\\address{${escapeLaTeX(name)}\\\\
${escapeLaTeX(streetAddress)}\\\\
${escapeLaTeX(city)}, ${escapeLaTeX(postalCode)}\\\\
${escapeLaTeX(phone)}\\\\
\\href{mailto:${email}}{${escapeLaTeX(email)}}}

\\date{${date ? escapeLaTeX(date) : today}}

\\opening{Dear Hiring Manager,}

${formatContent(content)}

${
  attachments
    ? `\\vspace{\\baselineskip}\\noindent Attachments: ${escapeLaTeX(
        attachments
      )}`
    : ""
}

\\closing{Sincerely,}

\\vspace{0.5in}
${escapeLaTeX(name)}

\\end{letter}
\\end{document}`;
};

// Enhanced cover letter generator controller
exports.coverLetterBuilder = async (req, res) => {
  try {
    const requiredFields = [
      "userId",
      "name",
      "email",
      "phone",
      "jobTitle",
      "company",
      "content",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
      });
    }

    const {
      userId,
      name,
      email,
      phone,
      streetAddress = "",
      city = "",
      postalCode = "",
      jobTitle,
      company,
      companyAddress = "",
      companyCity = "",
      companyPostalCode = "",
      date = "",
      attachments = "",
      content,
    } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate content length
    if (content.length > 5000) {
      return res
        .status(400)
        .json({ error: "Content is too long (max 5000 characters)" });
    }

    // Generate LaTeX content with improved error handling
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
      content,
    });

    // Set up directories
    const debugDir = path.join(__dirname, "debug");
    const outputDir = path.join(__dirname, "cover_letters");

    await Promise.all([
      fs.promises.mkdir(debugDir, { recursive: true }),
      fs.promises.mkdir(outputDir, { recursive: true }),
    ]);

    // Create unique filename
    const filename = `cover_letter_${userId}_${uuidv4().substring(0, 8)}`;
    const debugFilePath = path.join(debugDir, `${filename}.tex`);
    const outputPath = path.join(outputDir, `${filename}.pdf`);

    // Write LaTeX debug file
    await fs.promises.writeFile(debugFilePath, latexContent);

    // PDF generation with timeout
    const pdfGeneration = new Promise((resolve, reject) => {
      const options = {
        cmd: "pdflatex",
        inputs: debugDir,
        passes: 2,
      };

      const pdfStream = latex(latexContent, options);
      const output = fs.createWriteStream(outputPath);

      pdfStream.pipe(output);

      // Set timeout (30 seconds)
      const timeout = setTimeout(() => {
        pdfStream.end();
        reject(new Error("PDF generation timed out"));
      }, 30000);

      pdfStream.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      output.on("finish", () => {
        clearTimeout(timeout);
        resolve();
      });

      output.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    await pdfGeneration;

    // Save to database
    const newCoverLetter = new CoverLetter({
      user: userId,
      pdfPath: outputPath,
      createdAt: new Date(),
    });

    await newCoverLetter.save();
    user.coverLetters.push(newCoverLetter._id);
    await user.save();

    // Send PDF response
    res.download(outputPath, `cover_letter_${filename}.pdf`, (err) => {
      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (error) {
    console.error("Error generating cover letter:", error);

    let errorDetails = error.message;
    if (error.message.includes("LaTeX")) {
      const errorLogPath = path.join(__dirname, "debug", "latex_errors.log");
      try {
        const errorLog = await fs.promises.readFile(errorLogPath, "utf8");
        errorDetails = errorLog
          .split("\n")
          .filter((line) => line.startsWith("!"))
          .join("\n")
          .substring(0, 500); // Limit error details length
      } catch (readError) {
        console.error("Could not read LaTeX error log:", readError);
      }
    }

    res.status(500).json({
      error: "Failed to generate PDF",
      details: errorDetails,
      suggestion:
        "Check your input for special characters or formatting issues",
    });
  }
};
