const express = require("express");
const mongoose = require("mongoose");
const StudyPlan = require("../models/StudyPlan");
const QuizResult = require("../models/quizResult");
const User = require("../models/User");

const router = express.Router();

function calculateQuizScore(quiz) {
  if (!quiz.answers || quiz.answers.length === 0) return 0;
  const correct = quiz.answers.filter(a => a.isCorrect).length;
  return Math.round((correct / quiz.answers.length) * 100);
}

function computeStreak(quizzes) {
  if (!quizzes.length) return 0;
  const sorted = quizzes.sort((a, b) => new Date(a.attemptedAt) - new Date(b.attemptedAt));
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].attemptedAt);
    const curr = new Date(sorted[i].attemptedAt);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diffDays <= 1) streak++;
    else streak = 1;
  }
  return streak;
}

// GET /progress/:userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid userId format." });
  }

  try {
    // Study plan
    const studyPlan = await StudyPlan.findOne({ userId }).populate("topics.topicId");

    const totalTopics = studyPlan ? studyPlan.topics.length : 0;
    const completedTopics = studyPlan
      ? studyPlan.topics.filter(t => t.status === "completed").length
      : 0;

    const completionRate = totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;

    // Quizzes
    const quizResults = await QuizResult.find({ userId }).sort({ attemptedAt: -1 });
    const quizScores = quizResults.map(q => ({
      topicId: q.topicId,
      score: calculateQuizScore(q),
      attemptedAt: q.attemptedAt
    }));

    const averageScore = quizScores.length
      ? quizScores.reduce((sum, q) => sum + q.score, 0) / quizScores.length
      : 0;

    // Timeline (simple: topic completion order)
    const progressTimeline = studyPlan
      ? studyPlan.topics.map((t, i) => ({
          label: t.topicId?.name || `Topic ${i + 1}`,
          day: i + 1,
          value: t.status === "completed"
            ? Math.round(((i + 1) / totalTopics) * 100)
            : undefined
        }))
      : [];

    // Achievements
    const achievements = {
      currentStreak: computeStreak(quizResults)
    };

    // Final response (frontend-friendly shape)
    res.json({
      completedTopics,
      totalTopics,
      completionRate,
      quizScores,
      averageScore,
      progressTimeline,
      achievements
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

module.exports = router;