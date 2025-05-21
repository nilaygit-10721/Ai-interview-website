const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const database = require("./config/database.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Initialize express
const app = express();
app.use(cookieParser()); // ✅ add this

// Configure environment variables
dotenv.config();
const PORT = process.env.PORT || 4000;

//cors
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Your Vite development server
    ],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Import routes
const user = require("./routes/routes.js");

// Route middleware
app.use("/api/v1", user);

// Home route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Server Started Successfully",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`App is listening at port ${PORT}`);
});

// Connect to database using the connect method
database.connect();
