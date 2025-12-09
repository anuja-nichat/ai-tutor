// quiz.js - Updated version with topicName
const express = require("express");
const axios = require("axios");
const StudyPlan = require("../models/StudyPlan");
const QuizResult = require("../models/quizResult");
const Quiz = require("../models/Quiz");
const Topic = require("../models/Topic");
const router = express.Router();

// GET /quiz?userId=&subject=&topicId=
router.get("/", async (req, res) => {
  try {
    const { userId, subject, topicId } = req.query;

    if (!userId || !subject || !topicId) {
      return res.status(400).json({ error: "userId, subject, and topicId are required" });
    }

    // Verify user has this topic in their study plan
    const plan = await StudyPlan.findOne({ userId, "topics.topicId": topicId });
    if (!plan) return res.status(404).json({ error: "Study plan not found" });

    // ✅ Fetch topic name from Topic collection using _id
    const topicDoc = await Topic.findById(topicId);
    const topicName = topicDoc ? topicDoc.topic : "Unknown"; // <-- use "topic" field

    // Check if quiz already exists in database
    let storedQuiz = await Quiz.findOne({ topicId, subject });
    
    if (!storedQuiz) {
      // Generate new quiz from Flask using the topic name
      const response = await axios.post("http://localhost:5001/generate_quiz", {
        topic: topicName,
        subject
      });

      if (!response.data.quiz) {
        return res.status(500).json({ error: "Failed to generate quiz" });
      }

      // Store the quiz in database
      storedQuiz = new Quiz({
        topicId,
        subject,
        questions: response.data.quiz,
        generatedAt: new Date()
      });
      await storedQuiz.save();
    }

    // Return questions without answers
    const questions = storedQuiz.questions.map(q => ({
      questionId: q.questionId,
      question: q.question,
      options: q.options
    }));

    res.json({
      topic: topicName,
      subject,
      questions
    });
  } catch (error) {
    console.error("Error fetching quiz:", error.message);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

// POST /quiz/submit
router.post("/submit", async (req, res) => {
  try {
    const { userId, subject, topicId, answers } = req.body;

    if (!userId || !topicId) {
      return res.status(400).json({ error: "userId and topicId are required" });
    }

    // Get the stored quiz from database (with answers)
    const storedQuiz = await Quiz.findOne({ topicId, subject });
    
    if (!storedQuiz) {
      return res.status(404).json({ error: "Quiz not found. Please generate the quiz first." });
    }

    let correctCount = 0;
    const details = [];

    // answers is now an object with indices as keys: {0: "optionA", 1: "optionB"}
    for (const [questionIndex, selectedAnswer] of Object.entries(answers)) {
      const index = parseInt(questionIndex);
      const question = storedQuiz.questions[index];
      
      if (!question) continue;

      const isCorrect = selectedAnswer === question.answer;
      if (isCorrect) correctCount++;

      details.push({
        question: question.question,
        selected: selectedAnswer,
        correctAnswer: question.answer,
        isCorrect
      });
    }

    const totalQuestions = storedQuiz.questions.length;
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Save quiz result
    const quizResult = new QuizResult({
      userId,
      topicId,
      score,
      answers: details
    });
    await quizResult.save();

    res.json({
      totalQuestions,
      correct: correctCount,
      score,
      details
    });
  } catch (error) {
    console.error("Error submitting quiz:", error.message);
    res.status(500).json({ error: "Failed to evaluate quiz" });
  }
});

// Add to quiz.js for maintenance
router.delete("/cleanup", async (req, res) => {
  try {
    // MongoDB will auto-delete expired quizzes, but you can force cleanup
    const result = await Quiz.deleteMany({ 
      generatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    });
    res.json({ message: `Cleaned up ${result.deletedCount} old quizzes` });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({ error: "Cleanup failed" });
  }
});

module.exports = router;