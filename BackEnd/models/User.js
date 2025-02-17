const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },
    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    resumes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume", // Reference to Resume model
      },
    ],
    coverLetters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CoverLetter", // Reference to CoverLetter model
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users_data", userSchema);
