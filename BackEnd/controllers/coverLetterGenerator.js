const CoverLetter = require("../models/CoverLetter");
const User = require("../models/User");
const fs = require("fs/promises");
const path = require("path");
const latex = require("node-latex");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Simplified LaTeX escaping
const escapeLaTeX = (text = "") => {
  const escapeMap = {
    "\\": "\\textbackslash ",
    "&": "\\&",
    "%": "\\%",
    $: "\\$",
    "#": "\\#",
    _: "\\_",
    "{": "\\{",
    "}": "\\}",
    "~": "\\textasciitilde ",
    "^": "\\textasciicircum ",
  };

  return text.replace(/[\\&%$#_{}\^~]/g, (char) => escapeMap[char]);
};

// Format content for LaTeX with cleaner approach
const formatContent = (content = "") => {
  const escaped = escapeLaTeX(content);

  return escaped
    .split("\n\n")
    .map((paragraph) =>
      paragraph
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean)
    .join("\n\n");
};

// Generate LaTeX template with completely revised approach
const generateLatexCoverLetter = (data) => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Using article class instead of letter for more control over formatting
  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage[colorlinks=true]{hyperref}
\\usepackage{parskip}

\\geometry{
    left=1.25in,
    right=1.25in,
    top=1.25in,
    bottom=1.25in
}

\\begin{document}

\\thispagestyle{empty}

% Sender's address block (top left)
\\begin{flushleft}
${escapeLaTeX(data.name)}\\\\
${escapeLaTeX(data.streetAddress)}\\\\
${escapeLaTeX(data.city)}, ${escapeLaTeX(data.postalCode)}\\\\
${escapeLaTeX(data.phone)}\\\\
\\href{mailto:${data.email}}{${escapeLaTeX(data.email)}}
\\end{flushleft}

% Date (right aligned)
\\begin{flushright}
${data.date || today}
\\end{flushright}

% Recipient's address
\\vspace{0.5cm}
${escapeLaTeX(data.company)}\\\\
${escapeLaTeX(data.companyAddress)}\\\\
${escapeLaTeX(data.companyCity)}, ${escapeLaTeX(data.companyPostalCode)}

\\vspace{0.5cm}
\\noindent Dear Hiring Manager,

\\vspace{0.3cm}
${formatContent(data.content).replace(/\n\n/g, "\n\n\\noindent ")}

${
  data.attachments
    ? `\\vspace{0.5cm}
\\noindent Attachments: ${escapeLaTeX(data.attachments)}`
    : ""
}

\\vspace{0.5cm}
\\noindent Sincerely,

\\vspace{1cm}
\\noindent ${escapeLaTeX(data.name)}

\\end{document}`;
};

// Main controller function using async/await properly
exports.coverLetterBuilder = async (req, res) => {
  try {
    // Validate required fields
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

    // Destructure with defaults using modern JS
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
      return res.status(400).json({
        error: "Content is too long (max 5000 characters)",
      });
    }

    // Set up directories
    const debugDir = path.join(__dirname, "debug");
    const outputDir = path.join(__dirname, "cover_letters");

    // Create directories if they don't exist
    await Promise.all([
      fs.mkdir(debugDir, { recursive: true }),
      fs.mkdir(outputDir, { recursive: true }),
    ]);

    // Create unique filenames
    const fileId = uuidv4().substring(0, 8);
    const filename = `cover_letter_${userId}_${fileId}`;
    const debugFilePath = path.join(debugDir, `${filename}.tex`);
    const outputPath = path.join(outputDir, `${filename}.pdf`);

    // Generate LaTeX content
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

    // Write LaTeX debug file
    await fs.writeFile(debugFilePath, latexContent);

    // Generate PDF using promisified approach
    await new Promise((resolve, reject) => {
      const options = { cmd: "pdflatex", inputs: debugDir, passes: 2 };
      const pdfStream = latex(latexContent, options);
      const output = require("fs").createWriteStream(outputPath);

      // Set timeout
      const timeoutId = setTimeout(() => {
        reject(new Error("PDF generation timed out"));
      }, 30000);

      pdfStream.pipe(output);

      output.on("finish", () => {
        clearTimeout(timeoutId);
        resolve();
      });

      pdfStream.on("error", (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });

      output.on("error", (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
    });

    // Save to database
    const newCoverLetter = new CoverLetter({
      user: userId,
      pdfPath: outputPath,
      createdAt: new Date(),
    });

    await newCoverLetter.save();

    // Update user document
    user.coverLetters.push(newCoverLetter._id);
    await user.save();

    // Send PDF response
    res.download(outputPath, `${filename}.pdf`, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: "Failed to send PDF" });
      }
    });
  } catch (error) {
    console.error("Error generating cover letter:", error);

    // Provide helpful error information
    let errorDetails = error.message;
    if (error.message.includes("LaTeX")) {
      try {
        const errorLogPath = path.join(__dirname, "debug", "latex_errors.log");
        const errorLog = await fs.readFile(errorLogPath, "utf8");
        errorDetails = errorLog
          .split("\n")
          .filter((line) => line.startsWith("!"))
          .join("\n")
          .substring(0, 500);
      } catch (readError) {
        console.error("Could not read LaTeX error log:", readError);
      }
    }

    res.status(500).json({
      error: "Failed to generate PDF",
      details: errorDetails,
      suggestion:
        "Please check your input for special characters or formatting issues",
    });
  }
};
