const express = require("express");
const router = express.Router();
const {
  initializeMockTests,
  getMockTest,
  submitMockTest,
  getTestHistory
} = require("../controllers/mockTestController");

// Initialize mock tests (call this once on server start)
router.get("/init", async (req, res) => {
  await initializeMockTests();
  res.json({ message: "Mock tests initialized" });
});

// Get mock test based on user's target exam
router.get("/mock-test", getMockTest);

// Submit mock test
router.post("/mock-test/submit", submitMockTest);

// Get user's test history
router.get("/mock-test/history/:userId", getTestHistory);

module.exports = router;