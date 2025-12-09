const calculateScore = (test, userAnswers) => {
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let unanswered = 0;
  let totalMarks = 0;
  let marksObtained = 0;
  
  const processedAnswers = [];
  
  test.questions.forEach((question, index) => {
    const userAnswer = userAnswers.find(ans => 
      ans.questionId.toString() === question._id.toString()
    );
    
    let isCorrect = false;
    let pointsEarned = 0;
    let answerText = '';
    
    if (userAnswer && userAnswer.answer && userAnswer.answer.trim() !== '') {
      answerText = userAnswer.answer.trim();
      
      // Check if answer is correct
      if (question.questionType === 'multiple-choice') {
        isCorrect = answerText.toLowerCase() === question.correctAnswer.toLowerCase();
      } else if (question.questionType === 'true-false') {
        isCorrect = answerText.toLowerCase() === question.correctAnswer.toLowerCase();
      } else if (question.questionType === 'short-answer') {
        // For short answers, do case-insensitive comparison
        isCorrect = answerText.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      }
      
      if (isCorrect) {
        correctAnswers++;
        pointsEarned = test.instructions.correctMarks || question.points || 1;
      } else {
        wrongAnswers++;
        pointsEarned = test.instructions.wrongMarks || 0;
      }
    } else {
      unanswered++;
      answerText = '';
    }
    
    totalMarks += test.instructions.correctMarks || question.points || 1;
    marksObtained += pointsEarned;
    
    processedAnswers.push({
      questionId: question._id,
      userAnswer: answerText,
      isCorrect,
      pointsEarned,
      timeTaken: userAnswer?.timeTaken || 0
    });
  });
  
  const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
  
  return {
    answers: processedAnswers,
    score: {
      totalQuestions: test.questions.length,
      correctAnswers,
      wrongAnswers,
      unanswered,
      totalMarks,
      marksObtained,
      percentage
    }
  };
};

const generateFeedback = (score, test) => {
  const feedback = {
    tips: [],
    weakAreas: [],
    strategy: []
  };
  
  // Generate tips based on performance
  if (score.percentage >= 80) {
    feedback.tips.push("Excellent performance! Keep up the great work.");
    feedback.tips.push("You have a strong understanding of the subject matter.");
  } else if (score.percentage >= 60) {
    feedback.tips.push("Good effort! Review all incorrect answers to improve next attempt.");
    feedback.tips.push("Focus on areas where you made mistakes.");
  } else if (score.percentage >= 40) {
    feedback.tips.push("Review all incorrect answers to improve next attempt.");
    feedback.tips.push("Consider studying the topics more thoroughly before retaking.");
  } else {
    feedback.tips.push("Significant improvement needed. Review the study material carefully.");
    feedback.tips.push("Consider seeking additional help or resources.");
  }
  
  // Analyze weak areas
  if (score.wrongAnswers > score.correctAnswers) {
    feedback.weakAreas.push("Keep practicing weak areas highlighted in this test.");
  }
  
  if (score.unanswered > 0) {
    feedback.weakAreas.push("Time management - try to answer all questions.");
  }
  
  // Strategy suggestions
  if (score.percentage < 60) {
    feedback.strategy.push("Allocate more time to difficult sections next time.");
    feedback.strategy.push("Review fundamental concepts before attempting again.");
  }
  
  if (score.unanswered > score.totalQuestions * 0.2) {
    feedback.strategy.push("Attempt easy questions first, then return to the difficult ones.");
  }
  
  return feedback;
};

const isPassed = (percentage, passingScore = 50) => {
  return percentage >= passingScore;
};

module.exports = {
  calculateScore,
  generateFeedback,
  isPassed
};