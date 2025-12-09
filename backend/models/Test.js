const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    default: 'multiple-choice'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 1
  },
  explanation: {
    type: String,
    default: ''
  }
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  instructions: {
    duration: {
      type: Number, // in minutes
      default: 60
    },
    correctMarks: {
      type: Number,
      default: 4
    },
    wrongMarks: {
      type: Number,
      default: -1
    },
    allowRetake: {
      type: Boolean,
      default: true
    }
  },
  questions: [questionSchema],
  totalMarks: {
    type: Number,
    default: 0
  },
  passingScore: {
    type: Number,
    default: 50 // percentage
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total marks before saving
testSchema.pre('save', function(next) {
  this.totalMarks = this.questions.reduce((total, question) => total + question.points, 0);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Test', testSchema);