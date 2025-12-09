const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, required: true },
  profilePicture: { type: String, default: "" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobileNumber: { type: String, default: "" },
  email: { type: String, unique: true, required: true },
  aboutMe: { type: String, default: "" },
  grade: { 
    type: String, 
    enum: ["9", "10", "11", "12", "Other"],
    required: true 
  },
  stream: { 
    type: String, 
    enum: ["Science", "Commerce", "Arts", "Other", ""],
    default: "" 
  },
  targetExam: { 
    type: String, 
    enum: ["JEE", "NEET", "Board", "Other", ""],
    default: "" 
  },
  subjects: [{ 
    type: String, 
    enum: ["Mathematics", "Physics", "Biology", "Chemistry", "Zoology"] 
  }],
  dailyStudyHours: {
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("User", userSchema);