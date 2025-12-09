const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
  syllabusId: { type: mongoose.Schema.Types.ObjectId, ref: "Syllabus" },
  subject: String,      // "Physics"
  topic: String,        // "Laws of Motion"
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  vectorId: String,     // Pinecone vector ID
});

module.exports = mongoose.model("Topic", TopicSchema);