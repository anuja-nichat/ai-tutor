const express = require("express");
const StudyPlan = require("../models/StudyPlan");
const Topic = require("../models/Topic");
const router = express.Router();

// Get study plan for a user
// GET /studyplan/:userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get study plan with populated topics
    const studyPlan = await StudyPlan.findOne({ userId })
      .populate({
        path: 'topics.topicId',
        select: 'topic subject difficulty'
      })
      .populate('syllabusId', 'class subjects filename');

    if (!studyPlan) {
      return res.status(404).json({ error: "Study plan not found for this user" });
    }

    res.json({ studyPlan });
  } catch (error) {
    console.error("Error fetching study plan:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get study plan by syllabus for a user
// GET /studyplan/:userId/:syllabusId
router.get("/:userId/:syllabusId", async (req, res) => {
  try {
    const { userId, syllabusId } = req.params;

    if (!userId || !syllabusId) {
      return res.status(400).json({ error: "userId and syllabusId are required" });
    }

    // Get study plan with populated topics
    const studyPlan = await StudyPlan.findOne({ userId, syllabusId })
      .populate({
        path: 'topics.topicId',
        select: 'topic subject difficulty vectorId'
      })
      .populate('syllabusId', 'class subjects filename');

    if (!studyPlan) {
      return res.status(404).json({ error: "Study plan not found" });
    }

    res.json({ studyPlan });
  } catch (error) {
    console.error("Error fetching study plan:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all study plans for a user
// GET /studyplan/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get all study plans for user with populated data
    const studyPlans = await StudyPlan.find({ userId })
      .populate({
        path: 'topics.topicId',
        select: 'topic subject'
      })
      .populate('syllabusId', 'class subjects filename')
      .sort({ createdAt: -1 });

    res.json({ studyPlans });
  } catch (error) {
    console.error("Error fetching user study plans:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get study plan progress for a user
// GET /studyplan/progress/:userId
router.get("/progress/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get all study plans for user
    const studyPlans = await StudyPlan.find({ userId })
      .populate('syllabusId', 'class subjects');

    // Calculate progress
    const progress = studyPlans.map(plan => {
      const totalTopics = plan.topics.length;
      const completedTopics = plan.topics.filter(t => t.status === 'completed').length;
      const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

      return {
        studyPlanId: plan._id,
        syllabusId: plan.syllabusId,
        totalTopics,
        completedTopics,
        progressPercentage: Math.round(progressPercentage),
        createdAt: plan.createdAt
      };
    });

    res.json({ progress });
  } catch (error) {
    console.error("Error fetching study plan progress:", error);
    res.status(500).json({ error: error.message });
  }
});

// Mark topic as completed
// POST /studyplan/complete
router.post("/complete", async (req, res) => {
  try {
    const { userId, topicId } = req.body;

    const plan = await StudyPlan.findOne({ userId, "topics.topicId": topicId });
    if (!plan) {
      return res.status(404).json({ error: "Study plan or topic not found" });
    }

    // Update status
    plan.topics.forEach(t => {
      if (t.topicId.toString() === topicId) {
        t.status = "completed";
        t.completedAt = new Date();
      }
    });

    await plan.save();
    res.json({ message: "Topic marked as completed", plan });
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({ error: error.message });
  }
});

// Mark topic as pending
// POST /studyplan/pending
router.post("/pending", async (req, res) => {
  try {
    const { userId, topicId } = req.body;

    const plan = await StudyPlan.findOne({ userId, "topics.topicId": topicId });
    if (!plan) {
      return res.status(404).json({ error: "Study plan or topic not found" });
    }

    // Update status
    plan.topics.forEach(t => {
      if (t.topicId.toString() === topicId) {
        t.status = "pending";
        t.completedAt = null;
      }
    });

    await plan.save();
    res.json({ message: "Topic marked as pending", plan });
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;