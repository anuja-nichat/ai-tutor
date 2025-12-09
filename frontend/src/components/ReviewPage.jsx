import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, selectedOptions, score, animatedScore, examData } = location.state || {};

  const [showUnansweredOnly, setShowUnansweredOnly] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("ReviewPage received questions:", questions?.length);
    console.log("First question:", questions?.[0]);
    console.log("First question has answer field:", questions?.[0]?.answer);
  }, [questions]);

  if (!questions || !selectedOptions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Review Data Available</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics - FIXED COUNTING
  const correctAnswers = questions.filter((q, idx) => 
    selectedOptions[idx] !== undefined && selectedOptions[idx] === q.answer
  ).length;
  
  const wrongAnswers = questions.filter((q, idx) => 
    selectedOptions[idx] !== undefined && selectedOptions[idx] !== q.answer
  ).length;
  
  const unanswered = questions.filter((q, idx) => 
    selectedOptions[idx] === undefined
  ).length;

  // Filter questions based on showUnansweredOnly
  const filteredQuestions = showUnansweredOnly 
    ? questions.filter((q, idx) => selectedOptions[idx] === undefined)
    : questions;

  const getScoreColor = (percent) => {
    const r = Math.round(255 * (1 - percent / 100));
    const g = Math.round(255 * (percent / 100));
    return `rgb(${r},${g},0)`;
  };

  // Calculate percentage correctly
  const maxScore = questions.length * 4; // Maximum possible score
  const percentage = Math.round((animatedScore / maxScore) * 100);
  // Ensure percentage is between 0 and 100
  const displayPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Review</h1>
              <p className="text-lg text-gray-600">
                Detailed analysis of your {examData?.examType} mock test performance
              </p>
            </div>
            
            {/* Score Circle */}
            <div className="relative w-40 h-40">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={getScoreColor(displayPercentage)}
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={
                    2 * Math.PI * 70 * (1 - displayPercentage / 100)
                  }
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-indigo-600">
                  {animatedScore}
                </p>
                <p className="text-sm text-gray-600">
                  {displayPercentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm font-medium text-green-700">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
              <div className="text-sm font-medium text-red-700">Wrong</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{unanswered}</div>
              <div className="text-sm font-medium text-gray-700">Unanswered</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm font-medium text-blue-700">Total</div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowUnansweredOnly(!showUnansweredOnly)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  showUnansweredOnly
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300"
                }`}
              >
                {showUnansweredOnly ? "Show All Questions" : "Show Unanswered Only"}
              </button>
              <span className="text-sm text-gray-600">
                Showing {filteredQuestions.length} of {questions.length} questions
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Results
              </button>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const userAnswer = selectedOptions[idx];
            const isCorrect = userAnswer === q.answer;
            const isAnswered = userAnswer !== undefined;
            const globalIndex = questions.findIndex(question => question.id === q.id);
            
            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl shadow-lg border-2 transition-all ${
                  isCorrect 
                    ? "border-green-200 hover:border-green-300" 
                    : isAnswered 
                    ? "border-red-200 hover:border-red-300"
                    : "border-yellow-200 hover:border-yellow-300"
                }`}
              >
                <div className="p-6">
                  {/* Question Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                        isCorrect 
                          ? "bg-green-100 text-green-800" 
                          : isAnswered 
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {globalIndex + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {q.subject}
                      </span>
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {q.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        isCorrect 
                          ? "bg-green-100 text-green-800" 
                          : isAnswered 
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {isCorrect ? "Correct (+4)" : isAnswered ? "Wrong (-1)" : "Unanswered (0)"}
                      </span>
                    </div>
                  </div>

                  {/* Question */}
                  <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="grid gap-3 mb-6">
                    {q.options.map((opt, optIdx) => {
                      const isUserAnswer = userAnswer === opt;
                      const isCorrectAnswer = opt === q.answer;
                      
                      // Debug logging for first question
                      if (globalIndex === 0 && optIdx === 0) {
                        console.log("Question answer field:", q.answer);
                        console.log("Options:", q.options);
                        console.log("User answer:", userAnswer);
                      }
                      
                      return (
                        <div
                          key={optIdx}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isCorrectAnswer
                              ? "bg-green-50 border-green-300 shadow-sm"
                              : isUserAnswer && !isCorrectAnswer
                              ? "bg-red-50 border-red-300 shadow-sm"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center justify-center w-6 h-6 rounded text-sm font-semibold ${
                              isCorrectAnswer
                                ? "bg-green-600 text-white"
                                : isUserAnswer && !isCorrectAnswer
                                ? "bg-red-600 text-white"
                                : "bg-gray-300 text-gray-700"
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className={
                              isCorrectAnswer
                                ? "text-green-800 font-medium"
                                : isUserAnswer && !isCorrectAnswer
                                ? "text-red-800 font-medium"
                                : "text-gray-700"
                            }>
                              {opt}
                            </span>
                            {isCorrectAnswer && (
                              <span className="ml-auto text-green-600 font-semibold text-sm">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span className="ml-auto text-red-600 font-semibold text-sm">
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Answer Status */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Your answer: </span>
                        <span className={
                          isCorrect 
                            ? "text-green-600 font-semibold" 
                            : isAnswered 
                            ? "text-red-600 font-semibold" 
                            : "text-yellow-600 font-semibold"
                        }>
                          {userAnswer || "Not Answered"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-green-600 font-semibold">
                          {q.answer || "(Not available - check console)"}
                        </span>
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Question ID: <code className="bg-gray-100 px-2 py-1 rounded">{q.id}</code>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Top Button */}
        {filteredQuestions.length > 5 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Top
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewPage;