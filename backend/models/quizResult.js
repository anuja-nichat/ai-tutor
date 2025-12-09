const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topicId: { type: String, required: true },
  answers: [
    {
      question: String,
      selected: String,
      correctAnswer: String,
      isCorrect: Boolean
    }
  ],
  attemptedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizResult", quizResultSchema);