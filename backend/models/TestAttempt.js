const mongoose = require("mongoose");

const testAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  paperId: { type: String, required: true },
  examType: { type: String, enum: ["JEE", "NEET"], required: true },
  answers: { type: Map, of: Number }, // questionId -> selectedOptionIndex
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  unanswered: { type: Number, default: 0 },
  startedAt: { type: Date, required: true },
  finishedAt: { type: Date, required: true },
  timeTaken: { type: Number, default: 0 }, // in seconds
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TestAttempt", testAttemptSchema);