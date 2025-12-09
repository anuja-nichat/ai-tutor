const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const Progress = require("../models/Progress");
const User = require("../models/User");
const StudyPlan = require("../models/StudyPlan");
const Quiz = require("../models/Quiz");

const router = express.Router();

// ---------- Create notifications based on user data ----------
async function buildNotifications(user, progress) {
  const notifications = [];
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    // Check for existing notifications today to avoid duplicates
    const existingNotifications = await Notification.find({
      userId: user._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    const existingMessages = new Set(existingNotifications.map(n => n.message));

    // ---------- Daily Study Plan Reminder ----------
    const start = user.dailyStudyHours?.startTime || "09:00";
    const end = user.dailyStudyHours?.endTime || "17:00";
    const dailyPlanMsg = `⏰ Study from ${start} to ${end} today to stay on track!`;
    
    if (!existingMessages.has(dailyPlanMsg)) {
      notifications.push({
        userId: user._id,
        type: "Reminder",
        title: "Daily Study Plan",
        message: dailyPlanMsg,
        read: false,
        createdAt: new Date()
      });
    }

    // ---------- Upcoming Quizzes ----------
    if (user.subjects?.length) {
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      
      const upcomingQuizzes = await Quiz.find({ 
        subject: { $in: user.subjects },
        scheduledAt: { $lte: oneWeekFromNow, $gte: new Date() }
      })
      .sort({ scheduledAt: 1 })
      .limit(2)
      .lean();

      upcomingQuizzes.forEach((quiz, index) => {
        const quizMsg = `📅 Upcoming quiz for ${quiz.subject} on ${new Date(quiz.scheduledAt).toLocaleDateString()}`;
        if (!existingMessages.has(quizMsg)) {
          notifications.push({
            userId: user._id,
            type: "Reminder",
            title: "Upcoming Quiz",
            message: quizMsg,
            read: false,
            createdAt: new Date()
          });
        }
      });
    }

    // ---------- Performance Alerts ----------
    if (progress.quizScores && progress.quizScores.length > 0) {
      const latest = progress.quizScores[progress.quizScores.length - 1];
      if (latest.score < 50) {
        const performanceMsg = `⚠ Your last quiz score was ${latest.score}% — revise weak topics!`;
        if (!existingMessages.has(performanceMsg)) {
          notifications.push({
            userId: user._id,
            type: "Alert",
            title: "Low Score Alert",
            message: performanceMsg,
            read: false,
            createdAt: new Date()
          });
        }
      }
    }

    // ---------- Low Topic Completion Alert ----------
    const completed = progress.completedTopics?.length || 0;
    if (completed < 3) {
      const completionMsg = `📖 You've completed ${completed} topics — try finishing 1 more today!`;
      if (!existingMessages.has(completionMsg)) {
        notifications.push({
          userId: user._id,
          type: "Alert",
          title: "Study Progress",
          message: completionMsg,
          read: false,
          createdAt: new Date()
        });
      }
    }

    // ---------- Weekly Study Reminder (once per week) ----------
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (dayOfWeek === 1) { // Monday
      const weeklyMsg = "📚 Start your week strong! Plan your study sessions for this week.";
      if (!existingMessages.has(weeklyMsg)) {
        notifications.push({
          userId: user._id,
          type: "Reminder",
          title: "Weekly Planning",
          message: weeklyMsg,
          read: false,
          createdAt: new Date()
        });
      }
    }

    console.log(`Built ${notifications.length} new notifications for user ${user._id}`);
    return notifications;
  } catch (error) {
    console.error("Error building notifications:", error);
    return [];
  }
}

// ---------- GET /api/notifications/:userId ----------
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let progress = await Progress.findOne({ userId }).lean();
    if (!progress) {
      progress = { completedTopics: [], quizScores: [] };
    }

    // Build dynamic notifications
    const notificationsToAdd = await buildNotifications(user, progress);

    // Save new notifications to DB
    if (notificationsToAdd.length > 0) {
      for (const notif of notificationsToAdd) {
        try {
          // Check if similar notification already exists today
          const existing = await Notification.findOne({
            userId: notif.userId,
            message: notif.message,
            createdAt: { 
              $gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          });

          if (!existing) {
            await Notification.create(notif);
          }
        } catch (saveError) {
          console.error("Error saving notification:", saveError);
        }
      }
    }

    // Fetch ALL notifications for user (both read and unread)
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications);
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ---------- POST mark a notification as read ----------
router.post("/mark-read/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const updated = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("POST /mark-read error:", err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// ---------- POST mark all notifications as read ----------
router.post("/mark-all-read/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const result = await Notification.updateMany(
      { userId, read: false }, 
      { read: true }
    );

    res.json({ 
      success: true, 
      modifiedCount: result.modifiedCount,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (err) {
    console.error("POST /mark-all-read error:", err);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// ---------- DELETE a notification ----------
router.delete("/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const result = await Notification.findByIdAndDelete(notificationId);
    
    if (!result) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/notifications error:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

module.exports = router;