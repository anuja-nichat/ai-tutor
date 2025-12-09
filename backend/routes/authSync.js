// backend/routes/authSync.js
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Your User model

// Sync Firebase user with MongoDB
router.post("/sync-user", async (req, res) => {
  try {
    const { uid, email, firstName, lastName, displayName, photoURL } = req.body;

    // Check if user already exists in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        _id: uid, // Use Firebase UID as MongoDB _id
        firstName: firstName || displayName?.split(" ")[0] || "",
        lastName: lastName || displayName?.split(" ").slice(1).join(" ") || "",
        email,
        profilePicture: photoURL || "",
        grade: "Other",
        stream: "",
        targetExam: "",
        subjects: [],
        dailyStudyHours: {
          startTime: "",
          endTime: ""
        }
      });
    } else {
      // Update existing user with Firebase data if needed
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.profilePicture = photoURL || user.profilePicture;
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add to your backend routes (authSync.js or create a new file)
router.get("/health", async (req, res) => {
  try {
    // Simple MongoDB connection check
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ 
      status: "OK", 
      database: "Connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "Error", 
      database: "Disconnected",
      error: error.message 
    });
  }
});

// Add a debug endpoint to check if a user exists
router.get("/debug/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        exists: false, 
        message: "User not found in MongoDB" 
      });
    }
    
    res.status(200).json({ 
      exists: true, 
      user: user 
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

module.exports = router;