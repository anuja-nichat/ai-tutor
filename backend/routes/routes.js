const express = require("express");
const upload = require("../middleware/upload");
const Syllabus = require("../models/Syllabus");
const Topic = require("../models/Topic");
const StudyPlan = require("../models/StudyPlan");
const { parseSyllabus } = require("../services/parserService");
const { upsertSyllabusItems } = require("../services/vectorDBService");

const router = express.Router();

// Helper function to format time
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

// Helper function to distribute topics across days with time allocation
function createStudySchedule(topics, studyHoursPerDay = 2, totalDays = 30) {
  const dailySchedule = {};
  const minutesPerDay = studyHoursPerDay * 60;
  
  // Calculate time allocation based on difficulty
  const difficultyWeights = {
    'easy': 0.8,
    'medium': 1.0,
    'hard': 1.5
  };

  let totalWeight = 0;
  const topicsWithTime = topics.map(topic => {
    const weight = difficultyWeights[topic.difficulty] || 1.0;
    totalWeight += weight;
    return { ...topic, weight };
  });

  // Allocate time to each topic
  topicsWithTime.forEach(topic => {
    topic.allocatedMinutes = Math.round((topic.weight / totalWeight) * (minutesPerDay * totalDays));
    topic.allocatedTimeFormatted = formatTime(topic.allocatedMinutes);
  });

  // Distribute topics across days
  let currentDay = 1;
  let currentDayMinutes = 0;
  let currentDayTopics = [];

  topicsWithTime.forEach((topic, index) => {
    // If adding this topic would exceed daily limit, move to next day
    if (currentDayMinutes + topic.allocatedMinutes > minutesPerDay && currentDayTopics.length > 0) {
      dailySchedule[`day${currentDay}`] = currentDayTopics;
      currentDay++;
      currentDayMinutes = 0;
      currentDayTopics = [];
      
      // Stop if we exceed total days
      if (currentDay > totalDays) return;
    }

    const scheduledTopic = {
      subject: topic.subject,
      topic: topic.topic,
      time: topic.allocatedTimeFormatted,
      difficulty: topic.difficulty,
      topicId: topic._id
    };
    
    currentDayTopics.push(scheduledTopic);
    currentDayMinutes += topic.allocatedMinutes;
    
    // Update the topic with day allocation
    topic.scheduledDay = currentDay;
  });

  // Add remaining topics to the last day
  if (currentDayTopics.length > 0 && currentDay <= totalDays) {
    dailySchedule[`day${currentDay}`] = currentDayTopics;
  }

  return {
    dailySchedule,
    topicsWithTime,
    totalDays: Math.min(currentDay, totalDays),
    studyHoursPerDay
  };
}

router.post("/upload-syllabus/:userId", upload.single("file"), async (req, res) => {
  try {
    console.log('📤 File upload received:', req.file?.originalname);
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Extract userId from URL parameter
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "userId is required in URL" });
    }

    const parsedData = await parseSyllabus(req.file.path);
    console.log('✅ Python parsing completed');

    // Validate parsed data
    if (!parsedData) {
      return res.status(500).json({ error: "Parser returned empty data" });
    }

    const className = parsedData.class || "Unknown";
    
    // Handle both single-subject and multi-subject formats
    let subjectsData = {};
    let allItems = [];
    
    if (parsedData.subjects) {
      // Multi-subject format
      subjectsData = parsedData.subjects;
      console.log(`📊 Parsed multi-subject data: Class ${className}, Subjects: ${Object.keys(subjectsData).join(', ')}`);
    } else if (parsedData.subject && parsedData.topics) {
      // Single subject format (backward compatibility)
      subjectsData = { [parsedData.subject]: parsedData.topics };
      console.log(`📊 Parsed single-subject data: Class ${className}, Subject: ${parsedData.subject}`);
    } else {
      return res.status(500).json({ error: "Invalid parser response format" });
    }
    
    // Proper validation for items
    if (parsedData.items && Array.isArray(parsedData.items)) {
      allItems = parsedData.items;
    } else {
      console.warn('⚠️ No items array found in parsed data, using empty array');
    }

    console.log(`📊 Total items: ${allItems.length}`);

    // 1. FIRST create the Syllabus document to get a real ObjectId
    const syllabusRecord = new Syllabus({
      filename: req.file.originalname,
      class: className,
      subjects: subjectsData,
      vectorIds: [], // Start with empty array
      uploadedAt: new Date(),
    });
    
    await syllabusRecord.save();
    console.log('✅ Syllabus saved with ID:', syllabusRecord._id);

    // 2. NOW upsert vectors with the REAL syllabusId
    const vectorIds = await upsertSyllabusItems(
      req.file.filename, 
      className, 
      syllabusRecord._id,
      allItems
    );

    // 3. Update the syllabus record with the vector IDs
    syllabusRecord.vectorIds = vectorIds;
    await syllabusRecord.save();
    console.log('✅ Syllabus updated with vector IDs');

    // 4. Create Topic documents for each topic across all subjects
    const topicDocuments = [];
    for (const [subject, topics] of Object.entries(subjectsData)) {
      for (const topicName of topics) {
        const topicDoc = new Topic({
          syllabusId: syllabusRecord._id,
          subject: subject,
          topic: topicName,
          difficulty: "medium",
          vectorId: vectorIds.length > 0 ? vectorIds[0] : null
        });
        await topicDoc.save();
        topicDocuments.push(topicDoc);
        console.log(`✅ Topic created: ${subject} - ${topicName}`);
      }
    }

    // 5. AUTOMATICALLY CREATE STUDY PLAN with time allocation
    const studySchedule = createStudySchedule(
      topicDocuments.map(topic => ({
        _id: topic._id,
        subject: topic.subject,
        topic: topic.topic,
        difficulty: topic.difficulty
      })),
      2, // Default: 2 hours per day
      30 // Default: 30 days
    );

    // Create study plan topics with time allocation
    const studyPlanTopics = topicDocuments.map(topic => {
      const scheduledTopic = studySchedule.topicsWithTime.find(t => t._id.toString() === topic._id.toString());
      return {
        topicId: topic._id,
        status: "pending",
        allocatedTime: {
          minutes: scheduledTopic?.allocatedMinutes || 60,
          formatted: scheduledTopic?.allocatedTimeFormatted || "1h"
        },
        scheduledDay: scheduledTopic?.scheduledDay || 1,
        difficulty: topic.difficulty
      };
    });

    const studyPlan = new StudyPlan({
      userId: userId,
      syllabusId: syllabusRecord._id,
      topics: studyPlanTopics,
      schedule: {
        totalDays: studySchedule.totalDays,
        studyHoursPerDay: studySchedule.studyHoursPerDay,
        dailySchedule: studySchedule.dailySchedule
      }
    });

    await studyPlan.save();
    console.log('✅ Study plan created for user:', userId);

    return res.json({
      status: "success",
      message: "Parsed, embedded, indexed, saved, and study plan created with time allocation",
      class: className,
      subjects: subjectsData,
      count: allItems.length,
      vectorCount: vectorIds.length,
      syllabusId: syllabusRecord._id,
      studyPlanId: studyPlan._id,
      schedule: studySchedule.dailySchedule
    });

  } catch (err) {
    console.error("❌ Error in /upload-syllabus:", err.message);
    console.error("Full error:", err);
    return res.status(500).json({ 
      error: err.message || "Failed to process syllabus",
      details: "Check server logs for more information"
    });
  }
});

// Get study plan schedule
router.get("/study-plan/:userId/:syllabusId", async (req, res) => {
  try {
    const { userId, syllabusId } = req.params;

    const studyPlan = await StudyPlan.findOne({ userId, syllabusId })
      .populate({
        path: 'topics.topicId',
        select: 'topic subject'
      })
      .populate('syllabusId', 'class subjects filename');

    if (!studyPlan) {
      return res.status(404).json({ error: "Study plan not found" });
    }

    res.json({
      studyPlan: studyPlan.schedule.dailySchedule
    });

  } catch (error) {
    console.error("Error fetching study plan:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;