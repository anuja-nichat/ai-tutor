import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import Confetti from "react-confetti";
// 🎯 Import the custom loader component
import AtomicRingsLoader from "../components/Loading/AtomicRingsLoader.jsx"; 

const ProgressPage = () => {
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goal, setGoal] = useState("");
  const [goalSet, setGoalSet] = useState("");
  const [showCompletionPopup, setShowCompletionPopup] = useState(true);

  // Get current user ID from localStorage like Profile.jsx
  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem("mongoUser"));
    return user?._id;
  };

  // Fetch progress data
  useEffect(() => {
    const fetchProgress = async () => {
      const userId = getCurrentUserId();
      if (!userId) {
        setError("User not logged in");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/progress/${userId}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Map backend data to frontend-friendly format
        const mappedData = {
          completionRate: data.completionRate || 0,
          completedTopics: data.completedTopics || 0,
          totalTopics: data.totalTopics || 0,
          quizScores: data.quizScores?.map((q) => q.score) || [],
          averageScore: parseFloat(data.averageScore) || 0,
          currentStreak: data.achievements?.currentStreak || 0,
          progressTimeline: data.progressTimeline || [],
          achievements: [
            {
              icon: "✅",
              value: `Completed ${data.completedTopics || 0} out of ${data.totalTopics || 0} topics`
            },
            {
              icon: "📊",
              value: `Average quiz score: ${parseFloat(data.averageScore || 0).toFixed(2)}%`
            },
            {
              icon: "🔥",
              value: `Current streak: ${data.achievements?.currentStreak || 0} days`
            }
          ]
        };

        setProgressData(mappedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching progress data:", err);
        setError("Failed to load progress data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    setGoalSet(goal);
    setGoal("");
  };

  if (isLoading)
    return (
      <div
        className="h-screen w-full flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('/images/backgroundimage1.png')` }}
      >
        {/* 🎯 Loading Animation */}
        <AtomicRingsLoader />
      </div>
    );

  if (error)
    return (
      <div
        className="h-screen w-full flex items-center justify-center bg-cover bg-center bg-fixed text-red-600"
        style={{ backgroundImage: `url('/images/backgroundimage1.png')` }}
      >
        <div className="text-xl">{error}</div>
      </div>
    );

  // Pie chart data
  const pieData = [
    { name: "Completed", value: progressData.completionRate },
    { name: "Remaining", value: 100 - progressData.completionRate }
  ];
  const pieColors = ["#4CAF50", "#F0F0F0"];

  // Line chart data
  const quizChartData = progressData.quizScores.map((score, index) => ({
    name: `Quiz ${index + 1}`,
    score
  }));

  const getBgGradient = () => {
    if (progressData.completionRate < 50)
      return "bg-gradient-to-br from-gray-100 to-blue-100";
    if (progressData.completionRate < 90)
      return "bg-gradient-to-br from-blue-100 to-green-100";
    return "bg-gradient-to-br from-green-100 to-yellow-100";
  };

  return (
    <div
      className={`${getBgGradient()} min-h-screen p-8 font-sans antialiased relative`}
      style={{
        backgroundImage: "url('/images/backgroundimage1.png')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="container mx-auto">
            <h1 className="text-4xl font-extrabold text-green-300 backdrop-blur-sm mb-8 text-center">
          Your Progress Dashboard
        </h1>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
              Syllabus Completion
            </h2>
            <div className="w-full flex justify-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={60}
                      labelLine={false}
                      paddingAngle={5}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-gray-800">
                  {progressData.completionRate}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
              Quiz Scores History
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={quizChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-gray-500">
              <p>
                Average quiz score:{" "}
                <span className="font-bold text-green-600">
                  {progressData.averageScore.toFixed(2)}%
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Goal Setting */}
        <div className="mt-8 flex flex-col items-center">
          <form onSubmit={handleGoalSubmit} className="flex gap-2">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Set your next goal..."
              className="px-3 py-2 rounded border border-gray-300 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Set Goal
            </button>
          </form>
          {goalSet && (
            <div className="mt-2 text-green-600 font-semibold">
              🎯 Your goal: {goalSet}
            </div>
          )}
        </div>

        {/* Progress Timeline */}
        <div className="mt-8">
          <h3 className="text-2xl font-extrabold text-blue-300 mb-4 flex items-center gap-2 backdrop-blur-sm">
            📅 Progress Timeline
          </h3>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg">
            <div className="max-h-80 overflow-y-auto pr-2">
              <ul className="space-y-6">
                {progressData.progressTimeline.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="bg-yellow-500 text-white rounded-full p-2 text-xl">
                      📈
                    </span>
                    <div>
                      <span className="font-bold text-yellow-700">
                        {item.label}
                      </span>
                      {item.day && (
                        <span className="ml-2 text-gray-500">Day {item.day}</span>
                      )}
                      {item.value !== undefined && (
                        <span className="ml-2 text-gray-500">
                          {item.value}%
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-8">
          <h3 className="text-2xl font-extrabold text-green-300 mb-4 flex items-center gap-2 backdrop-blur-sm">
            🏆 Your Achievements
          </h3>
          <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-6 shadow-lg">
            <ul className="list-none text-gray-700 space-y-4">
              {progressData.achievements.map((ach, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className="bg-green-500 text-white rounded-full p-2 text-xl">
                    {ach.icon}
                  </span>
                  <span>{ach.value}</span>
                </li>
              ))}
              </ul>
            </div>
        </div>

        {/* Confetti for high completion */}
        {progressData.completionRate >= 75 && (
          <div className="absolute inset-0 pointer-events-none">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
            />
          </div>
        )}

        {/* Completion popup */}
        {progressData.completionRate === 100 && showCompletionPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center animate-bounce relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                onClick={() => setShowCompletionPopup(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                You have completed your syllabus!
              </p>
              <p className="text-md text-gray-500">
                Celebrate your achievement and set new goals!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;