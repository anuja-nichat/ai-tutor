const express = require("express");
const User = require("../models/User");
const firebaseAuth = require("../middleware/firebaseAuth");
const router = express.Router();

/**
 * POST /api/users/sync
 * Sync Firebase user → MongoDB user
 * Called after client signs in with Firebase
 */
router.post("/sync", firebaseAuth, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.firebaseUser;
    const { firstName, lastName, grade, stream, targetExam, subjects, dailyStudyHours } = req.body;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Parse first/last name from Firebase if not provided
      const splitName = name ? name.split(" ") : [];
      const fName = firstName || splitName[0] || "";
      const lName = lastName || splitName.slice(1).join(" ") || "";

      user = new User({
        firebaseUid: uid,
        email,
        firstName: fName,
        lastName: lName,
        profilePicture: picture || "",
        grade: grade || "Other",
        stream: stream || "",
        targetExam: targetExam || "",
        subjects: subjects || [],
        dailyStudyHours: dailyStudyHours || { startTime: "", endTime: "" }
      });

      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/me
 * Get the logged-in user's MongoDB record
 */
router.get("/me", firebaseAuth, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

/**
 * PUT /api/users/me
 * Update the logged-in user's profile
 */
router.put("/me", firebaseAuth, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: Date.now() };

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: req.firebaseUser.uid },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: Date.now() };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user by ID:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;