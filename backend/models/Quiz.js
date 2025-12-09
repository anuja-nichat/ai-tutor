const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  subject: { type: String, required: true },
  questions: [
    {
      questionId: String,
      question: String,
      options: [String],
      answer: String
    }
  ],
  generatedAt: { type: Date, default: Date.now, expires: 86400 }
});

module.exports = mongoose.model("Quiz", quizSchema);