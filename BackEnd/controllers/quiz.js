require("dotenv").config();
const axios = require("axios");
const Quiz = require("../models/Quiz");
const OPENAI_API_KEY = process.env.API_KEY;
const OPENAI_BASE_URL = process.env.BASE_URL;

// Function to interact with ChatGPT
const chatWithGPT = async (messages) => {
  try {
    const userMessage = messages.map((msg) => msg.content).join("\n");

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyD9OHRIsKkW-wTl_jRG39r30pDZ6k2xBBc`,
      {
        contents: [
          {
            parts: [{ text: userMessage }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return (
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response."
    );
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error);
    throw new Error("Gemini API failed");
  }
};

exports.quiz = async (req, res) => {
  try {
    const { role, company, experience } = req.body;

    if (!role || !company || !experience) {
      return res
        .status(400)
        .json({ error: "Role, company, and experience are required" });
    }

    const prompt = `You are an AI assistant that generates structured JSON data. 
Generate a **10-question multiple-choice quiz** for a **${role}** position at **${company}**. 
The candidate has **${experience}** years of experience.  

Each question must have **4 options**, with **one correct answer**.  
⚠️ **STRICTLY RETURN ONLY VALID JSON** (no explanations, no extra text).  

JSON Format:
[
  {
    "questionText": "What is ...?",
    "answers": [
      { "text": "Option A", "isCorrect": false },
      { "text": "Option B", "isCorrect": true },
      { "text": "Option C", "isCorrect": false },
      { "text": "Option D", "isCorrect": false }
    ]
  },
  ...
]`;

    const quizContent = await chatWithGPT([{ role: "user", content: prompt }]);

    let cleanContent = quizContent.trim();

    // Remove Markdown-style code fencing if present
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent
        .replace(/```(?:json)?\n?/, "")
        .replace(/```$/, "");
    }

    let quizData;
    try {
      quizData = JSON.parse(cleanContent);
    } catch (error) {
      console.error("Error parsing GPT response:", error);
      return res
        .status(500)
        .json({ error: "Invalid AI-generated quiz format" });
    }

    // Step 2: Save quiz to MongoDB
    const quiz = new Quiz({
      title: `${role} Quiz at ${company}`,
      description: `A quiz for a ${role} position at ${company} with ${experience} years of experience.`,
      questions: quizData,
    });

    await quiz.save();

    // Step 3: Return quiz as response
    res.status(200).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
