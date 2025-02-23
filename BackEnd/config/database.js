const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

exports.connect = async () => {
    try {
        await mongoose.connect(MONGODB_URL, {
           
        });
        console.log("DB Connection Success");
    } catch (err) {
        console.error("DB Connection Failed");
        console.error(err);
        process.exit(1);
    }
};
