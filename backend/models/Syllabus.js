const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema({
  filename: String,
  class: String,
  subjects: Object,
  vectorIds: [String],
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Syllabus", syllabusSchema);