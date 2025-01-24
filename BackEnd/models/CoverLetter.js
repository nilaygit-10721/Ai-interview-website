const mongoose = require('mongoose');

const coverLetterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobDetails: {
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    hiringManager: {
      type: String,
      required: true,
    },
    howDidYouFind: {
      type: String,
      required: true,
    },
    creativityRating: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
  },
  applicantName: {
    type: String,
    required: true,
  },
  coverLetterContent: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CoverLetter', coverLetterSchema);
