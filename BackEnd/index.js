const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const database = require("./config/database.js");

// Initialize express
const app = express();

// Configure environment variables
dotenv.config();
const PORT = process.env.PORT || 4000;

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
<<<<<<< HEAD
    console.log(`App is listening at port ${PORT}`)
})
=======
    console.log(`App is listening at port ${PORT}`);
});

// Connect to database using the connect method
database.connect();
>>>>>>> origin/main
