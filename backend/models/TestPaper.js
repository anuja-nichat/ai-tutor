const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
  subject: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  explanation: { type: String, default: "" }
});

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  questions: [questionSchema]
});

const testPaperSchema = new mongoose.Schema({
  paperId: { type: String, required: true, unique: true },
  examType: { type: String, enum: ["JEE", "NEET", "Board"], required: true },
  title: { type: String, required: true },
  duration: { type: Number, default: 180 }, // in minutes
  totalMarks: { type: Number, default: 720 },
  sections: [sectionSchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TestPaper", testPaperSchema);