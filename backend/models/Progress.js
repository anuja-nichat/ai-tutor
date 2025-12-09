const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
  score: { type: Number, required: true }, // percent (0 - 100)
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  completedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
  quizScores: [quizAttemptSchema],
});

module.exports = mongoose.model("Progress", progressSchema);