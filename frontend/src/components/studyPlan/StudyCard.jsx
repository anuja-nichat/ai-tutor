import React, { useState } from "react";

const StudyCard = ({ study, onMarkDone, onTakeQuiz }) => {
  const [isCompleted, setIsCompleted] = useState(study.completed);
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkDone = async () => {
    setIsLoading(true);
    try {
      await onMarkDone(study.id, !isCompleted);
      setIsCompleted(!isCompleted);
    } catch (error) {
      console.error("Error marking as done:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectColor = (subject) => {
    const colors = {
      Physics: "from-blue-500 to-blue-600",
      Chemistry: "from-green-500 to-green-600",
      Biology: "from-purple-500 to-purple-600",
      Mathematics: "from-red-500 to-red-600",
    };
    return colors[subject] || "from-gray-500 to-gray-600";
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
        isCompleted
          ? "border-teal-400 bg-teal-50"
          : "border-gray-200 hover:border-teal-300"
      }`}
    >
      <div
        className={`h-2 rounded-t-xl bg-gradient-to-r ${getSubjectColor(
          study.subject
        )}`}
      ></div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {study.subject}
              </h3>
              {/* ✅ Removed Difficulty Label */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                {study.examType}
              </span>
            </div>

            <p className="text-gray-700 font-medium mb-3 leading-relaxed">
              {study.topic}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">{study.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">{study.timeSlot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Buttons Section */}
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-2 ${
              isCompleted ? "text-teal-600" : "text-gray-500"
            }`}
          >
            {isCompleted && (
              <svg
                className="w-5 h-5 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span className="font-medium">
              {isCompleted ? "Completed" : "Pending"}
            </span>
          </div>

          <div className="flex gap-3">
            {/* ✅ Start Quiz Button */}
            <button
              onClick={() => onTakeQuiz && onTakeQuiz(study)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Quiz
            </button>

            {/* ✅ Mark as Done Button */}
            <button
              onClick={handleMarkDone}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                isCompleted
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-lg hover:shadow-xl"
              } ${
                isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : isCompleted ? (
                "Mark Pending"
              ) : (
                "Mark as Done"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCard;
