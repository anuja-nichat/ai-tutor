const mongoose = require("mongoose");
const TestPaper = require("../models/TestPaper");
const TestAttempt = require("../models/TestAttempt");
const User = require("../models/User");
const { JEE_MOCK_TEST, NEET_MOCK_TEST, BOARD_MOCK_TEST } = require("../data/mockTestData");

// Initialize mock tests in database
const initializeMockTests = async () => {
  try {
    // Check if tests already exist
    const existingJEE = await TestPaper.findOne({ paperId: "JEE_MOCK_001" });
    const existingNEET = await TestPaper.findOne({ paperId: "NEET_MOCK_001" });
    const existingBoard = await TestPaper.findOne({ paperId: "BOARD_MOCK_001" });

    if (!existingJEE) {
      await TestPaper.create(JEE_MOCK_TEST);
      console.log("JEE mock test initialized");
    }

    if (!existingNEET) {
      await TestPaper.create(NEET_MOCK_TEST);
      console.log("NEET mock test initialized");
    }

    if (!existingBoard) {
      await TestPaper.create(BOARD_MOCK_TEST);
      console.log("Board mock test initialized");
    }
  } catch (error) {
    console.error("Error initializing mock tests:", error);
  }
};

// Get mock test based on user's target exam
const getMockTest = async (req, res) => {
  try {
    const { userId } = req.query;
    
    console.log("Received request for mock test, userId:", userId);

    // Default to NEET if no user found
    let targetExam = "NEET";
    
    if (userId && userId !== "test123") {
      // Find user to get their target exam
      const user = await User.findById(userId);
      console.log("Found user:", user);
      
      if (user && user.targetExam) {
        // Use the target exam directly as it comes from the User model
        // which already has the correct format: "JEE", "NEET", or "Board"
        targetExam = user.targetExam;
        console.log("User's target exam:", targetExam);
      }
    }

    console.log("Target exam for test paper search:", targetExam);
    
    // Find active test paper for the target exam
    const testPaper = await TestPaper.findOne({ 
      examType: targetExam, 
      isActive: true 
    });

    if (!testPaper) {
      console.log("No test paper found for:", targetExam);
      return res.status(404).json({ error: "No mock test found for the specified exam" });
    }

    console.log("Found test paper:", testPaper.paperId);

    // Return test paper without answers for security
    const testPaperWithoutAnswers = {
      paperId: testPaper.paperId,
      examType: testPaper.examType,
      title: testPaper.title,
      duration: testPaper.duration,
      totalMarks: testPaper.totalMarks,
      sections: testPaper.sections.map(section => ({
        name: section.name,
        subject: section.subject,
        questions: section.questions.map(question => ({
          id: question.id,
          question: question.question,
          options: question.options,
          subject: question.subject,
          difficulty: question.difficulty
        }))
      }))
    };

    res.json(testPaperWithoutAnswers);

  } catch (error) {
    console.error("Error fetching mock test:", error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
};

// Submit mock test - FIXED COUNTING
const submitMockTest = async (req, res) => {
  try {
    const { paperId, examType, userId, answers, startedAt, finishedAt, score } = req.body;

    console.log("Received submission:", { paperId, examType, userId, answers, score });

    // Validate required fields
    if (!paperId || !examType || !userId || !startedAt || !finishedAt) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["paperId", "examType", "userId", "startedAt", "finishedAt"]
      });
    }

    // Check if user exists (using string comparison since we're using mock user ID)
    const user = await User.findOne({ _id: userId });
    if (!user) {
      console.log("User not found with ID:", userId);
      // For development, we'll continue even if user not found
      console.log("Continuing with submission despite user not found...");
    }

    // Get the test paper to verify answers and calculate detailed results
    const testPaper = await TestPaper.findOne({ paperId });
    if (!testPaper) {
      return res.status(404).json({ error: "Test paper not found" });
    }

    // Calculate detailed results - FIXED COUNTING
    let calculatedScore = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    const totalQuestions = testPaper.sections.reduce((total, section) => total + section.questions.length, 0);

    // Calculate score and answer statistics - FIXED: Only check answered questions
    testPaper.sections.forEach(section => {
      section.questions.forEach(question => {
        const userAnswerIndex = answers[question.id];
        
        if (userAnswerIndex === undefined || userAnswerIndex === null) {
          unanswered++;
          return; // Skip if unanswered
        }

        // Only check answer if user actually answered
        const userAnswer = question.options[userAnswerIndex];
        if (userAnswer === question.answer) {
          calculatedScore += 4;
          correctAnswers++;
        } else {
          calculatedScore -= 1;
          wrongAnswers++;
        }
      });
    });

    // Use provided score if available, otherwise use calculated score
    const finalScore = score !== undefined ? score : calculatedScore;

    const timeTaken = Math.floor((new Date(finishedAt) - new Date(startedAt)) / 1000);

    console.log("Score calculation:", {
      finalScore,
      correctAnswers,
      wrongAnswers,
      unanswered,
      totalQuestions
    });

    // Create test attempt
    const testAttempt = new TestAttempt({
      userId,
      paperId,
      examType,
      answers,
      score: finalScore,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unanswered,
      startedAt: new Date(startedAt),
      finishedAt: new Date(finishedAt),
      timeTaken
    });

    await testAttempt.save();

    console.log("Test attempt saved successfully:", testAttempt._id);

    // Return questions with correct answers for review
    const questionsWithAnswers = testPaper.sections.flatMap(section => 
      section.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        answer: q.answer,
        subject: q.subject,
        difficulty: q.difficulty
      }))
    );

    console.log("✅ Sending questionsWithAnswers:", questionsWithAnswers.length, "questions");
    console.log("First question answer:", questionsWithAnswers[0]?.answer);

    res.json({
      success: true,
      message: "Test submitted successfully",
      score: finalScore,
      correctAnswers,
      wrongAnswers,
      unanswered,
      totalQuestions,
      timeTaken,
      attemptId: testAttempt._id,
      percentage: ((finalScore / (totalQuestions * 4)) * 100).toFixed(2),
      questionsWithAnswers // Include correct answers for review
    });

  } catch (error) {
    console.error("Error submitting mock test:", error);
    
    // More detailed error logging
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation error", 
        details: error.message 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: "Invalid data format", 
        details: error.message 
      });
    }

    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's test history
const getTestHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const testHistory = await TestAttempt.find({ userId })
      .sort({ finishedAt: -1 })
      .select("paperId examType score totalQuestions correctAnswers wrongAnswers unanswered finishedAt timeTaken");

    res.json(testHistory);
  } catch (error) {
    console.error("Error fetching test history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  initializeMockTests,
  getMockTest,
  submitMockTest,
  getTestHistory
};