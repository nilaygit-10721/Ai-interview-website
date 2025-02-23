const Resume = require("../models/Resume");
const User = require("../models/User");
const fs = require("fs");
const axios = require("axios");
const latex = require("node-latex");
const path = require("path");
require("dotenv").config();




// Resume builder function
exports.resumeBuilder = async (req, res) => {
    try {
        const { 
            userId, 
            name, 
            email, 
            phone, 
            portfolio = "",
            github = "",
            linkedin = "",
            codingProfiles = [],
            education = [],
            additionalActivities = [],
            skills = {
                programmingLanguages: [],
                softwareDevelopment: [],
                webTechnologies: [],
                databasesAndTools: []
            },
            projects = [], 
            experience = [], 
            achievements = []
        } = req.body;

        // Validation
        if (!userId || !name || !email || !phone) {
            return res.status(400).json({ error: "Basic information is required" });
        }

        if (!skills.programmingLanguages.length || !projects.length || !education.length) {
            return res.status(400).json({ error: "Skills, projects, and education are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Function to escape LaTeX special characters
        const escapeLatex = (text) => {
            if (!text) return '';
            // Convert to string if it's not already
            text = String(text);
            // First handle backslash to avoid double-escaping
            text = text.replace(/\\/g, '\\textbackslash{}');
            return text
                .replace(/&/g, '\\&')
                .replace(/%/g, '\\%')
                .replace(/\$/g, '\\$')
                .replace(/#/g, '\\#')
                .replace(/_/g, '\\_')
                .replace(/\{/g, '\\{')
                .replace(/\}/g, '\\}')
                .replace(/~/g, '\\textasciitilde{}')
                .replace(/\^/g, '\\textasciicircum{}')
                .replace(/</g, '\\textless{}')
                .replace(/>/g, '\\textgreater{}');
        };

        // URL safe function for hrefs - URLs need special handling
        const escapeUrl = (url) => {
            if (!url) return '';
            // For URLs, we need to be careful with escaping
            // Only escape specific characters that would break LaTeX URLs
            return String(url)
                .replace(/%/g, '\\%')
                .replace(/#/g, '\\#')
                .replace(/&/g, '\\&')
                .replace(/~/g, '\\~{}')
                .replace(/\^/g, '\\^{}');
        };

        // Social links formatting
        let socialLinksCode = "";
        if (portfolio) {
            socialLinksCode += `\\faLink \\hspace{3pt} \\href{${escapeUrl(portfolio)}}{Portfolio} \\quad\n`;
        }
        if (github) {
            socialLinksCode += `\\faGithub \\hspace{3pt} \\href{${escapeUrl(github)}}{Github} \\quad\n`;
        }
        if (linkedin) {
            socialLinksCode += `\\faLinkedin \\hspace{3pt} \\href{${escapeUrl(linkedin)}}{LinkedIn} \\quad\n`;
        }
        
        // Add any coding profiles
        codingProfiles.forEach(profile => {
            if (profile.platform && profile.link) {
                const icon = profile.platform.toLowerCase().includes('codechef') ? '\\faCodeBranch' :
                             profile.platform.toLowerCase().includes('leetcode') ? '\\faCode' :
                             profile.platform.toLowerCase().includes('hackerrank') ? '\\faHackerrank' : '\\faCodepen';
                             
                socialLinksCode += `${icon} \\hspace{3pt} \\href{${escapeUrl(profile.link)}}{${escapeLatex(profile.platform)}} \\quad\n`;
            }
        });

        // Format education section
        const educationCode = education.map(edu => {
            return `\\begin{onecolentry}
    \\textbf{${escapeLatex(edu.institution)}} 
    \\textit{${escapeLatex(edu.degree)}, ${escapeLatex(edu.duration)}}\\\\
    \\textbf{${escapeLatex(edu.gpaLabel || "GPA")}:} ${escapeLatex(edu.gpa)}${edu.scale ? `/${escapeLatex(edu.scale)}` : ""}
\\end{onecolentry}`;
        }).join('\n\n');

        // Format additional activities
        const activitiesCode = additionalActivities.length > 0 ? 
            `\\section{Additional Activities}
\\begin{onecolentry}
    \\begin{highlights}
        ${additionalActivities.map(activity => 
            `\\item \\textbf{${escapeLatex(activity.title)}} (${escapeLatex(activity.period)}) - ${escapeLatex(activity.description)}`
        ).join('\n        ')}
    \\end{highlights}
\\end{onecolentry}` : '';

        // Format skills section
        const skillsCode = `\\section{Skills}
${skills.programmingLanguages.length ? `\\textbf{Programming Languages:} ${skills.programmingLanguages.map(escapeLatex).join(', ')}\\\\` : ''}
${skills.softwareDevelopment.length ? `\\textbf{Software Development:} ${skills.softwareDevelopment.map(escapeLatex).join(', ')}\\\\` : ''}
${skills.webTechnologies.length ? `\\textbf{Web Technologies/Libraries:} ${skills.webTechnologies.map(escapeLatex).join(', ')}\\\\` : ''}
${skills.databasesAndTools.length ? `\\textbf{Databases and Tools:} ${skills.databasesAndTools.map(escapeLatex).join(', ')}` : ''}`;

        // Format projects section
        const projectsCode = projects.map(project => {
            const projectTitle = escapeLatex(project.title);
            // Handle project link
            const projectLink = project.link ? 
                `\\href{${escapeUrl(project.link)}}{${projectTitle}}` : 
                projectTitle;
                
            // Technologies need special handling if they contain & characters
            const technologies = project.technologies ? 
                `\\textbf{${escapeLatex(project.technologies)}}` : '';
            
            let itemsList = '';
            if (Array.isArray(project.description)) {
                itemsList = project.description.map(item => `\\item ${escapeLatex(item)}`).join('\n        ');
            } else if (typeof project.description === 'string') {
                itemsList = `\\item ${escapeLatex(project.description)}`;
            }
            
            // Modified structure to avoid potential & conflicts
            return `\\begin{onecolentry}
    {\\textbf{\\large ${projectLink}}}${technologies ? ` {\\hfill ${technologies}}` : ''}
    \\begin{itemize}
        ${itemsList}
    \\end{itemize}
\\end{onecolentry}
\\vspace{7pt}`;
        }).join('\n');

        // Format experience section
        const experienceCode = experience.length > 0 ? 
    `\\section{Experience}
${experience.map(exp => {
    let expContent = '';
    if (typeof exp === 'string') {
        expContent = escapeLatex(exp);
    } else { 
        expContent = `\\textbf{${escapeLatex(exp.title)}} \\hfill ${escapeLatex(exp.company)} | ${escapeLatex(exp.period)}`;

        if (exp.description) {
            const bulletPoints = exp.description.split('. ').map(point => `\\item ${escapeLatex(point)}`).join('\n');
            expContent += `\n\\begin{itemize}\n${bulletPoints}\n\\end{itemize}`;
        }
    }
    
    return `\\begin{onecolentry}
    ${expContent}
\\end{onecolentry}`;
}).join('\n\\vspace{7pt}\n')}` : '';


        // Format achievements section
        const achievementsCode = achievements.length > 0 ? 
            `\\section{Achievements}
\\begin{onecolentry}
    \\begin{itemize}
        ${achievements.map(achievement => `\\item ${escapeLatex(achievement)}`).join('\n        ')}
    \\end{itemize}
\\end{onecolentry}` : '';

      // Construct the LaTeX document with defined color
const latexTemplate = `\\documentclass[10pt, letterpaper]{article}
\\usepackage[
    ignoreheadfoot,
    top=0.5cm,
    bottom=0.5cm,
    left=0.5cm,
    right=0.5cm,
    footskip=1.0cm
]{geometry}
\\usepackage{titlesec, tabularx, array, xcolor, enumitem, fontawesome5, amsmath, hyperref, eso-pic, calc, bookmark, lastpage, changepage, paracol, ifthen, needspace, iftex}

% Define colors
\\definecolor{primaryColor}{RGB}{0, 102, 204}

% Use protective groups for pdfinfo to avoid & issues
\\hypersetup{
    pdftitle={{${escapeLatex(name)}'s CV}},
    pdfauthor={{${escapeLatex(name)}}},
    pdfcreator={{LaTeX with RenderCV}},
    colorlinks=true,
    urlcolor=primaryColor
}

\\pagestyle{empty}
\\setcounter{secnumdepth}{0}
\\setlength{\\parindent}{0pt}
\\setlength{\\columnsep}{0cm}
\\setlist[itemize]{nosep}

% Define missing environments if needed
\\newenvironment{onecolentry}{}{} % Fallback if not defined already
\\newenvironment{highlights}{\\begin{itemize}}{\\end{itemize}} % Fallback for highlights environment

\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule]
\\titlespacing{\\section}{-1pt}{0.3cm}{0.2cm}
\\titleformat{\\subsection}{\\bfseries\\small}{}{0pt}{}{}
\\renewcommand{\\normalsize}{\\large}

\\begin{document}

% Header
\\begin{center}
    {\\LARGE\\bfseries ${escapeLatex(name)}}\\\\[5pt]
    {\\makebox[\\textwidth][c]{%
        \\faEnvelope[regular] \\href{mailto:${escapeUrl(email)}}{${escapeLatex(email)}} \\quad
        \\faPhone* \\href{tel:${escapeUrl(phone)}}{${escapeLatex(phone)}} \\quad
        ${socialLinksCode}
    }}
\\end{center}

% Education Section
\\section{Education}
${educationCode}

${activitiesCode}

% Skills Section
${skillsCode}

% Projects Section
\\section{Projects}
${projectsCode}

% Experience Section
${experienceCode}

% Achievements Section
${achievementsCode}

\\end{document}`;

        // For debugging purposes - write the LaTeX code to a file
        const debugDir = path.join(__dirname, "debug");
        if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir, { recursive: true });
        }
        fs.writeFileSync(path.join(debugDir, `resume_${userId}_debug.tex`), latexTemplate);

        // Generate PDF
        const outputDir = path.join(__dirname, "resumes");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, `resume_${userId}_${Date.now()}.pdf`);

        // Options for node-latex
        const options = {
            inputs: debugDir,  // Allow including files from our debug directory
            passes: 3,         // Multiple passes to resolve references
            errorLogs: path.join(debugDir, 'latex_errors.log') // Log errors for debugging
        };

        // Convert LaTeX to PDF
        const pdfStream = latex(latexTemplate, options);
        const output = fs.createWriteStream(outputPath);
        pdfStream.pipe(output);

        output.on('finish', async () => {
            try {
                const newResume = new Resume({ user: userId, pdfPath: outputPath });
                await newResume.save();
                user.resumes.push(newResume._id);
                await user.save();
                res.download(outputPath, "resume.pdf");
            } catch (error) {
                console.error("Error saving resume to database:", error);
                res.status(500).json({ error: "Failed to save resume" });
            }
        });

        pdfStream.on('error', (error) => {
            console.error("Error generating PDF:", error);
            
            // Check if the error log file exists and read it for more details
            const errorLogPath = path.join(debugDir, 'latex_errors.log');
            if (fs.existsSync(errorLogPath)) {
                const errorLog = fs.readFileSync(errorLogPath, 'utf8');
                console.error("LaTeX Error Log:", errorLog);
                
                // Extract the most relevant error message
                const errorMatch = errorLog.match(/(?:! )(.*?)(?:\n|$)/g);
                if (errorMatch) {
                    return res.status(500).json({ 
                        error: "Failed to generate PDF", 
                        details: errorMatch.join(' ').trim()
                    });
                }
            }
            
            res.status(500).json({ error: "Failed to generate PDF", details: error.message });
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
};
