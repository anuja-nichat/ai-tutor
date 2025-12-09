const express = require("express");
const mongoose = require("mongoose");
const StudyPlan = require("../models/StudyPlan");
const QuizResult = require("../models/quizResult");

const router = express.Router();

// Helper functions
async function getWeeklyStudyTrend(userId) {
    // Since we don't have studySessions collection, we'll simulate based on quiz activity
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Estimate study hours based on quiz activity (2 hours per quiz)
        const quizzes = await QuizResult.find({
            userId: userId,
            attemptedAt: { $gte: date, $lte: endOfDay }
        });
        
        const estimatedHours = quizzes.length * 2; // 2 hours per quiz
        days.push({
            date: date.toDateString(),
            hours: Math.min(estimatedHours, 8) // Cap at 8 hours per day
        });
    }
    return days;
}

function calculateQuizScore(quiz) {
  if (!quiz.answers || quiz.answers.length === 0) return 0;
  const correct = quiz.answers.filter(a => a.isCorrect).length;
  return Math.round((correct / quiz.answers.length) * 100);
}

async function getQuizAccuracyTrend(userId) {
  const trend = [];
  const recentQuizzes = await QuizResult.find({ userId })
    .sort({ attemptedAt: -1 })
    .limit(7);

  recentQuizzes.reverse().forEach(quiz => {
    trend.push({
      date: quiz.attemptedAt.toDateString(),
      score: calculateQuizScore(quiz)
    });
  });
  return trend;
}

async function getTodaysPlan(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get today's scheduled topics from study plan
    const studyPlan = await StudyPlan.findOne({ userId })
        .populate('topics.topicId');
    
    if (!studyPlan) return null;
    
    const todaysTopics = studyPlan.topics.filter(topic => 
        topic.scheduledDay && topic.scheduledDay === 1 // Assuming day 1 is today for simplicity
    );
    
    return {
        topics: todaysTopics.map(topic => ({
            subject: topic.topicId?.subject || 'General',
            topic: topic.topicId?.topic || 'Unknown Topic',
            time: topic.allocatedTime?.formatted || '1h',
            status: topic.status
        })),
        totalHours: todaysTopics.reduce((sum, topic) => {
            const minutes = topic.allocatedTime?.minutes || 60;
            return sum + (minutes / 60);
        }, 0)
    };
}

async function getUserBadges(userId, completionRate) {
    const badges = [];
    
    if (completionRate >= 90) {
        badges.push({ name: "Gold Medal", type: "medal", icon: "🏅" });
    } else if (completionRate >= 75) {
        badges.push({ name: "Silver Medal", type: "medal", icon: "🥈" });
    } else if (completionRate >= 50) {
        badges.push({ name: "Bronze Medal", type: "medal", icon: "🥉" });
    }
    
    const quizCount = await QuizResult.countDocuments({ userId });
        
    if (quizCount >= 10) {
        badges.push({ name: "Quiz Master", type: "badge", icon: "🎯" });
    }
    
    if (quizCount >= 5) {
        badges.push({ name: "Quiz Enthusiast", type: "badge", icon: "📚" });
    }
    
    return badges;
}

// GET /api/dashboard/:userId
// GET /api/dashboard/:userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  let upcomingTests = [];

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId format.' });
  }

  try {
    // 1. Get user study plans and progress
    const studyPlans = await StudyPlan.find({ userId })
      .populate("topics.topicId")
      .populate("syllabusId");

    // Calculate completed and total topics
    let completedTopics = 0;
    let totalTopics = 0;

    studyPlans.forEach(plan => {
      totalTopics += plan.topics.length;
      completedTopics += plan.topics.filter(topic => topic.status === "completed").length;
    });

    const completionRate = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    // 2. Get quiz results
    const quizResults = await QuizResult.find({ userId }).sort({ attemptedAt: -1 });

    const quizScores = quizResults.map(q => calculateQuizScore(q));
    const totalQuizScore = quizScores.reduce((sum, s) => sum + s, 0);
    const averageQuizScore = quizScores.length > 0 ? totalQuizScore / quizScores.length : 0;

    // 3. Weekly study hours (estimated)
    const weeklyStudyHours = quizResults.length * 2; // 2 hrs per quiz
    const avgDailyStudyHours = weeklyStudyHours / 7;

    // 4. Trends
    const weeklyTrend = await getWeeklyStudyTrend(userId);
    const quizTrend = await getQuizAccuracyTrend(userId);

    // 5. Today's plan
    const todayPlan = await getTodaysPlan(userId);

    // 6. Badges
    const badges = await getUserBadges(userId, completionRate);

    // 7. Upcoming tests
    const User = require("../models/User");
    const user = await User.findById(userId);
    if (user) {
      if (user.targetExam === "JEE") {
        upcomingTests.push({
          exam: "JEE",
          duration: "180min",
          sections: ["Physics", "Chemistry", "Mathematics"]
        });
      } else if (user.targetExam === "NEET") {
        upcomingTests.push({
          exam: "NEET",
          duration: "180min",
          sections: ["Physics", "Chemistry", "Biology"]
        });
      }
    }

    // Final response
    const dashboardData = {
      overview: {
        weeklyStudyHours: Math.round(weeklyStudyHours * 100) / 100,
        avgDailyStudyHours: Math.round(avgDailyStudyHours * 100) / 100,
        quizzesCompleted: quizResults.length,
        averageQuizScore: Math.round(averageQuizScore * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100
      },
      progress: {
        completedTopics,
        totalTopics,
        completionRate: Math.round(completionRate * 100) / 100,
        progressPercentage: Math.round(completionRate)
      },
      upcomingTests,
      trends: {
        weeklyStudy: weeklyTrend,
        quizAccuracy: quizTrend
      },
      todayPlan,
      badges,
      stats: {
        totalStudyPlans: studyPlans.length,
        totalQuizAttempts: quizResults.length,
        lastQuizDate: quizResults.length > 0 ? quizResults[0].attemptedAt : null
      }
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


module.exports = router;