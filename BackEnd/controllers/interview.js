require("dotenv").config();
const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// exports.interview = async (req, res) => {
//     try {
//         const { text } = req.body;

//         if (!text) {
//             return res.status(400).json({ error: "Text is required" });
//         }

//         // STEP 2: Make a request to Deepgram
//         const response = await deepgram.speak.request(
//             { text },
//             {
//                 model: "aura-asteria-en",
//                 encoding: "linear16",
//                 container: "wav",
//             }
//         );

//         // STEP 3: Get the audio stream
//         const stream = await response.getStream();
//         if (!stream) {
//             return res.status(500).json({ error: "Failed to generate audio" });
//         }

//         // Convert stream to buffer
//         const buffer = await getAudioBuffer(stream);

//         // STEP 4: Set headers and return audio as response
//         res.setHeader("Content-Type", "audio/wav");
//         res.setHeader("Content-Disposition", 'attachment; filename="output.wav"');
//         res.send(buffer);

//     } catch (error) {
//         console.error("Error generating audio:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

// Helper function to convert stream to audio buffer
const getAudioBuffer = async (response) => {
    const reader = response.getReader();
    const chunks = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    return Buffer.concat(chunks);
};


// exports.voiceToText = async (audioStream, res) => {
//     try {
//         console.log("Initializing live transcription...");

//         // Create a Deepgram live transcription connection
//         const connection = deepgram.listen.live({
//             model: "nova-3",
//             language: "en-US",
//             smart_format: true,
//         });

//         let transcriptText = "";

//         // Event listeners for transcription
//         connection.on(LiveTranscriptionEvents.Open, () => {
//             console.log("Live transcription started.");

//             connection.on(LiveTranscriptionEvents.Transcript, (data) => {
//                 const transcript = data.channel.alternatives[0].transcript;
//                 if (transcript) {
//                     console.log("Transcript:", transcript);
//                     transcriptText += transcript + " ";
//                 }
//             });

//             connection.on(LiveTranscriptionEvents.Metadata, (data) => {
//                 console.log("Metadata:", data);
//             });

//             connection.on(LiveTranscriptionEvents.Close, () => {
//                 console.log("Transcription connection closed.");
//                 res.json({ transcript: transcriptText.trim() }); // Send final transcript
//             });

//             connection.on(LiveTranscriptionEvents.Error, (err) => {
//                 console.error("Deepgram Error:", err);
//                 res.status(500).json({ error: "Transcription failed" });
//             });

//             // Read and send audio chunks from buffer stream
//             audioStream.on("data", (chunk) => {
//                 if (connection.getReadyState() === 1) {
//                     connection.send(chunk);
//                 }
//             });

//             audioStream.on("end", () => {
//                 console.log("Audio stream ended.");
//                 connection.finish(); // Finish transcription
//             });
//         });

//     } catch (error) {
//         console.error("Error processing live stream:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };



const axios = require("axios");


const OPENAI_API_KEY = process.env.API_KEY;
const OPENAI_BASE_URL = process.env.BASE_URL;

// Function to interact with ChatGPT
const chatWithGPT = async (messages) => {
    try {
        const response = await axios.post(
            `${OPENAI_BASE_URL}/chat/completions`,
            {
                model: "gpt-4o",
                messages,
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data.choices[0].message.content; // Extract response
    } catch (error) {
        console.error("ChatGPT API Error:", error.response?.data || error);
        throw new Error("ChatGPT API failed");
    }
};

const multer = require("multer");
const pdfParse = require("pdf-parse");


// Store state in memory (in real apps, use DB or session)
let conversationHistory = [];
let questionCount = 0;

const upload = multer({ storage: multer.memoryStorage() });

// Main interview route
exports.interview = [
  upload.single("resume"),
  async (req, res) => {
    try {
      const { role, company } = req.body;
      const file = req.file;

      if (!file || !role || !company) {
        return res.status(400).json({ error: "Resume (PDF), role, and company are required" });
      }

      if (file.mimetype !== "application/pdf") {
        return res.status(400).json({ error: "Only PDF resumes are supported." });
      }

      const pdfData = await pdfParse(file.buffer);
      const resumeText = pdfData.text;

      conversationHistory = [
        {
          role: "system",
          content: `You are an interviewer hiring for a ${role} role at ${company}.`
        },
        {
          role: "user",
          content: `Here is my resume:\n${resumeText}\nStart the interview with a relevant question.`
        }
      ];

      const question = await chatWithGPT(conversationHistory);
      console.log("ChatGPT Question:", question);
      conversationHistory.push({ role: "assistant", content: question });
      questionCount = 1;

      const response = await deepgram.speak.request(
        { text: question },
        { model: "aura-asteria-en", encoding: "linear16", container: "wav" }
      );

      const buffer = await getAudioBuffer(await response.getStream());

      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Disposition", 'attachment; filename="interview_question.wav"');
      res.send(buffer);

    } catch (error) {
      console.error("Error in interview:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
];

// Follow-up and transcription route

let transcriptBuffer = "";
let debounceTimer;

const fs = require("fs");
exports.voiceToText = [
  upload.single("audio"), // Accept audio file field named "audio"
  async (req, res) => {
    try {
      const file = req.file;

      if (!file || !file.buffer) {
        return res.status(400).json({ error: "Audio file is required" });
      }

      // Step 1: Transcribe audio using Deepgram prerecord API
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        file.buffer,
        {
          model: "nova-3",
          language: "en-US",
          smart_format: true,
        }
      );

      if (error) {
        console.error("Deepgram Error:", error);
        return res.status(500).json({ error: "Deepgram transcription failed" });
      }

      const transcript = result.results.channels[0].alternatives[0].transcript;
      console.log("Full Transcript:", transcript);

      // Maintain conversation history and track question count
      const conversationHistory = [
        { role: "system", content: "You are a professional interviewer." },
        { role: "user", content: transcript }
      ];

      // Step 2: Send transcript to ChatGPT
      const gptResponse = await chatWithGPT(conversationHistory);
      console.log("ChatGPT Response:", gptResponse);

      // Step 3: Convert GPT response to speech
      const tts = await deepgram.speak.request(
        { text: gptResponse },
        {
          model: "aura-asteria-en",
          encoding: "linear16",
          container: "wav"
        }
      );

      const audioBuffer = await getAudioBuffer(await tts.getStream());

      // Step 4: Send the generated audio
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Disposition", 'attachment; filename="response.wav"');
      res.send(audioBuffer);

    } catch (err) {
      console.error("Interview audio processing error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
];
