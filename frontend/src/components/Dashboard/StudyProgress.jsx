import { TrendingUp, Trophy } from "lucide-react";

const StudyProgress = ({ progress = {}, overview = {} }) => {
  // Destructure safely with fallbacks
  const {
    completedTopics = 0,
    totalTopics = 0,
  } = progress;

  const { averageQuizScore = 0 } = overview;

  // ✅ FIX: Calculate completion percentage correctly
  // Use the actual completed/total ratio instead of the inconsistent completionRate
  const actualCompletionRate = totalTopics > 0 ? (completedTopics / totalTopics) : 0;
  const completionPercentage = Math.round(actualCompletionRate * 100);

  // Handle average quiz score
  const displayAverageScore = Math.round(averageQuizScore);

  // Inline component for circular progress
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-block">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-blue-500 transition-all duration-700 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-2xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Your Progress</h2>
          </div>
          <Trophy className="h-5 w-5 text-white opacity-80" />
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Circular Progress - Show actual calculated percentage */}
        <div className="text-center mb-6">
          <CircularProgress percentage={completionPercentage} />
          <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">
            Overall Progress
          </h3>
          <p className="text-gray-600">
            {completedTopics} of {totalTopics} topics completed
          </p>
          {/* Debug info - remove in production */}
          <p className="text-xs text-gray-400 mt-1">
            Calculated: {completionPercentage}%
          </p>
        </div>

        {/* Progress Metrics */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Completion Rate
              </span>
              <span className="text-sm font-semibold text-purple-600 bg-white px-3 py-1 rounded-full shadow-sm">
                {completionPercentage}%
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Average Quiz Score
              </span>
              <span className="text-sm font-semibold text-green-600 bg-white px-3 py-1 rounded-full shadow-sm">
                {displayAverageScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="text-center bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-600 mb-1">Topics Done</p>
            <p className="font-bold text-blue-600 text-lg">{completedTopics}</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-600 mb-1">Total Topics</p>
            <p className="font-bold text-gray-800 text-lg">{totalTopics}</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-600 mb-1">Quizzes Done</p>
            <p className="font-bold text-purple-600 text-lg">{overview.quizzesCompleted || 0}</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-600 mb-1">Study Hours</p>
            <p className="font-bold text-green-600 text-lg">{Math.round(overview.weeklyStudyHours || 0)}h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyProgress;