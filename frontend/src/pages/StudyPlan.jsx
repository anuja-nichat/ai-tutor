import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CalendarView from "../components/studyPlan/CalendarView";
import ListView from "../components/studyPlan/ListView";
import ProgressTracker from "../components/studyPlan/ProgressTracker";
import ApiService from "../services/api";

// Import the custom loader component (The requested change)
import AtomicRingsLoader from "../components/Loading/AtomicRingsLoader.jsx"; 

// Helper to get current user
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem("mongoUser"));
  return user?._id || null;
};

// Format backend study plan to frontend-friendly structure
const formatBackendStudyPlan = (backendData) => {
  const dailySchedule = backendData?.studyPlan?.schedule?.dailySchedule || {};
  const topics = backendData?.studyPlan?.topics || [];

  console.log('Backend study plan data:', backendData);
  console.log('Daily schedule keys:', Object.keys(dailySchedule));
  console.log('Topics array:', topics);

  return Object.keys(dailySchedule).map((dayKey, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    const subjects = dailySchedule[dayKey].map((item) => {
      // ✅ FIX: Better topic matching logic
      const topicObj = topics.find(t => {
        // Handle different topicId formats
        const scheduleTopicId = item.topicId?.toString();
        
        // Check if topicId matches directly
        if (t.topicId?._id?.toString() === scheduleTopicId) {
          return true;
        }
        if (t.topicId?.toString() === scheduleTopicId) {
          return true;
        }
        // Also check the _id field of the topic object itself
        if (t._id?.toString() === scheduleTopicId) {
          return true;
        }
        
        return false;
      });
      
      // ✅ FIX: If no topicObj found, create a basic one from the schedule item
      const isCompleted = topicObj?.status === 'completed';
      const subject = topicObj?.topicId?.subject || item.subject || "Physics";
      
      // ✅ FIX: Use the correct topicId - prioritize the schedule item's topicId
      const correctTopicId = item.topicId?.toString();

      console.log('Topic matching result:', {
        scheduleTopic: item.topic,
        scheduleTopicId: item.topicId,
        foundTopicObj: topicObj ? topicObj.topicId : 'Not found',
        isCompleted: isCompleted,
        correctTopicId: correctTopicId
      });

      return {
        id: correctTopicId, // ✅ Use the schedule item's topicId
        subject: subject,
        topic: item.topic,
        duration: item.time || item.duration,
        timeSlot: item.timeSlot || 'Morning',
        completed: isCompleted,
        difficulty: item.difficulty || 'Medium',
        examType: item.examType || 'JEE',
        // Store raw topicId for API calls
        rawTopicId: item.topicId,
        _id: correctTopicId // ✅ Use the correct topicId
      };
    });

    return {
      date: date.toISOString().split('T')[0],
      subjects
    };
  });
};

const StudyPlan = () => {
  const [currentView, setCurrentView] = useState("list");
  const [studyData, setStudyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load study plan
  const loadStudyPlan = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      if (!userId) throw new Error("No user logged in");

      console.log('Loading study plan for user:', userId);
      
      const data = await ApiService.getStudyPlan(userId);
      console.log('Raw API response:', data);
      
      const formattedData = formatBackendStudyPlan(data);
      console.log('Formatted study data:', formattedData);
      
      setStudyData(formattedData);
      setError(null);
    } catch (err) {
      console.error("Error loading study plan:", err);
      setError("Failed to load study plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudyPlan();
  }, [loadStudyPlan]);

  // Mark topic as done/pending
  const handleMarkDone = async (topicId, completed) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) throw new Error("No user logged in");

      console.log('Marking topic:', { 
        topicId, 
        completed, 
        userId,
        currentStudyData: studyData 
      });

      // Call the appropriate API route
      if (completed) {
        await ApiService.markProgress(userId, topicId);
      } else {
        await ApiService.markPending(userId, topicId);
      }

      // Update frontend state immediately for better UX
      setStudyData((prevData) =>
        prevData.map((day) => ({
          ...day,
          subjects: day.subjects.map((sub) =>
            sub.id.toString() === topicId.toString() ? { ...sub, completed } : sub
          ),
        }))
      );

      // Reload study plan to sync with backend
      setTimeout(() => {
        loadStudyPlan();
      }, 500);

    } catch (err) {
      console.error("Error updating topic status:", err);
      // NOTE: Using alert here, but ideally should be replaced with a custom UI modal
      alert("Failed to update topic status. Please try again.");
      
      // Revert UI change on error
      setStudyData((prevData) =>
        prevData.map((day) => ({
          ...day,
          subjects: day.subjects.map((sub) =>
            sub.id.toString() === topicId.toString() ? { ...sub, completed: !completed } : sub
          ),
        }))
      );
    }
  };

  // Navigate to Quiz with selected topic using React Router state
const handleTakeQuiz = (topic) => {
  // ✅ FIX: Always use the rawTopicId or _id from the topic object
  const topicId = topic.rawTopicId?.toString() || topic._id?.toString() || topic.id?.toString();
  
  // ✅ FIX: Ensure subject is properly extracted
  const subject = topic.subject || "Physics";
  
  const quizTopicData = {
    subject: subject,
    topic: topic.name || topic.topic,
    topicId: topicId,
    completed: topic.status === "completed"
  };

  console.log("Passing quiz topic data via state:", {
    subject: quizTopicData.subject,
    topic: quizTopicData.topic,
    topicId: quizTopicData.topicId,
    rawTopicId: topic.rawTopicId,
    _id: topic._id,
    id: topic.id
  });

  // ✅ Pass data via navigation state instead of localStorage
  navigate("/quiz", { state: { selectedTopic: quizTopicData } });
};

  // View icons
  const getViewIcon = (view) => {
    const icons = {
      list: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      progress: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
        </svg>
      ),
    };
    return icons[view];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Replacement with AtomicRingsLoader */}
        <AtomicRingsLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Error Loading Study Plan</h2>
          <p className="text-gray-500 mb-4 text-sm sm:text-base">{error}</p>
          <button 
            onClick={loadStudyPlan}
            className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/backgroundimage1.png')" }}
    >
      {/* Header (Study Plan Navbar) */}
      {/* This section is now transparent to show the background image */}
      <div className="bg-transparent shadow-md"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 h-auto sm:h-16 py-3 sm:py-0">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                {/* Text colors updated for contrast */}
                <h1 className="text-xl sm:text-2xl font-bold text-white">Study Plan</h1>
                <p className="text-sm text-gray-300">JEE & NEET Preparation Schedule</p>
              </div>
            </div>

            {/* View Toggle */}
            {/* Added transparent background and blur for readability */}
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-lg p-1 w-full sm:w-auto justify-between sm:justify-start border border-white/20">
              {['list', 'calendar', 'progress'].map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`flex items-center gap-2 flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                    currentView === view
                      // Active button remains white for high contrast
                      ? 'bg-white text-teal-600 shadow-sm'
                      // Inactive button text updated for contrast
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {getViewIcon(view)}
                  <span className="hidden xs:inline capitalize">{view}</span>
                </button>
              ))}
          </div>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'list' && (
          <ListView 
            studyData={studyData} 
            onMarkDone={handleMarkDone}
            onTakeQuiz={handleTakeQuiz}
          />
        )}
        {currentView === 'calendar' && (
          <CalendarView 
            studyData={studyData} 
            onMarkDone={handleMarkDone}
            onTakeQuiz={handleTakeQuiz}
          />
        )}
        {currentView === 'progress' && (
          <ProgressTracker studyData={studyData} />
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={loadStudyPlan}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-3 sm:p-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        title="Refresh Study Plan"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
};

export default StudyPlan;