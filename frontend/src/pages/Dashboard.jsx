import React, { useState, useEffect, useMemo } from "react";
import { Bell, Clock } from "lucide-react";
import TodaysPlan from "../components/Dashboard/TodaysPlan.jsx";
import UpcomingQuiz from "../components/Dashboard/UpcomingQuiz.jsx";
import StudyHoursChart from "../components/Dashboard/StudyHoursChart.jsx";
import StudyProgress from "../components/Dashboard/StudyProgress.jsx";
import QuizAccuracyChart from "../components/Dashboard/QuizAccuracyChart.jsx";
import StatsCard from "../components/Dashboard/StatsCard.jsx";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api.js";
import AtomicRingsLoader from "../components/Loading/AtomicRingsLoader.jsx";

// ✅ Helper to safely get current userId from localStorage
const getCurrentUserId = () => {
  try {
    const stored = localStorage.getItem("mongoUser");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?._id || null;
  } catch (err) {
    console.error("Failed to parse user from localStorage", err);
    return null;
  }
};

// ⏰ Separate Clock Widget (only this re-renders every second)
const ClockWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg border border-gray-100">
      <Clock className="h-5 w-5 text-indigo-600" />
      <span className="text-lg font-semibold text-gray-800">{formatTime(currentTime)}</span>
      <span className="text-sm text-gray-500">
        {currentTime.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  );
};

// 🔔 Notifications Badge Component
const NotificationsBadge = ({ count, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="relative text-gray-500 hover:text-gray-700 transition-colors p-2 flex justify-center items-center w-full sm:w-auto rounded-md bg-white shadow-sm hover:shadow-md"
    >
      <Bell size={22} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

// 🔔 Quick Notifications Panel
const QuickNotificationsPanel = ({ notifications, isOpen, onClose, onMarkRead, onViewAll }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="p-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <div 
              key={notification.id} 
              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
              onClick={() => onMarkRead(notification)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                </div>
                {!notification.read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(notification.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          ))
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <button 
            onClick={onViewAll}
            className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const userId = getCurrentUserId();
  const navigate = useNavigate();
  console.log("User ID:", userId);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🔔 Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  // 📊 Fetch dashboard data
  useEffect(() => {
    if (!userId) {
      console.warn("No user found in localStorage");
      setLoading(false);
      setError("Please log in to view dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data for user:", userId);
        const res = await fetch(`http://localhost:5000/api/dashboard/${userId}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch dashboard data: ${res.status}`);
        }

        const data = await res.json();
        console.log("Dashboard data received:", data);
        setDashboardData(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // 🔔 Fetch notifications
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const data = await ApiService.getNotifications(userId);
        setNotifications(data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
    
    // Refresh notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, [userId]);

  // 🔔 Handle mark notification as read
  const handleMarkNotificationRead = async (notification) => {
    try {
      if (!notification.read) {
        await ApiService.markNotificationRead(notification.id);
      }
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // 🔔 FIXED: Handle view all notifications
  const handleViewAllNotifications = () => {
    setShowNotificationsPanel(false);
    
    // Try different navigation approaches
    console.log("Navigating to notifications page...");
    
    // Method 1: Direct navigation
    navigate('/notifications');
    
    // Method 2: Fallback - check if navigation worked after a delay
    setTimeout(() => {
      if (window.location.pathname !== '/notifications') {
        console.log("Navigation failed, trying alternative...");
        // Alternative: Use window.location as fallback
        window.location.href = '/notifications';
      }
    }, 1000);
  };

  // 🔔 Get unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // 🔔 Get recent notifications (max 5, unread first)
  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => {
        // Unread first, then by date
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 5);
  }, [notifications]);

  // ✅ Memoize overview entries so they don't rebuild every render
  const overviewEntries = useMemo(
    () => Object.entries(dashboardData?.overview || {}),
    [dashboardData?.overview]
  );

  // Show loading state
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url("/images/backgroundimage1.png")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center">
          <AtomicRingsLoader />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url("/images/backgroundimage1.png")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show message if no data
  if (!dashboardData) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url("/images/backgroundimage1.png")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center bg-white/80 backdrop-blur-md rounded-2xl p-6">
          <p className="text-gray-600">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{
        backgroundImage: 'url("/images/backgroundimage1.png")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-lg">
          Welcome, Student
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto relative">
          <NotificationsBadge 
            count={unreadNotificationsCount} 
            onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
          />
          <QuickNotificationsPanel
            notifications={recentNotifications}
            isOpen={showNotificationsPanel}
            onClose={() => setShowNotificationsPanel(false)}
            onMarkRead={handleMarkNotificationRead}
            onViewAll={handleViewAllNotifications}
          />
          <ClockWidget />
        </div>
      </div>

      {/* Notification Alert Banner */}
      {unreadNotificationsCount > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800 font-medium">
                You have {unreadNotificationsCount} unread notification{unreadNotificationsCount !== 1 ? 's' : ''}
              </p>
            </div>
            <button 
              onClick={handleViewAllNotifications}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View All
            </button>
          </div>
        </div>
      )}

      {/* Weekly Analysis */}
      {overviewEntries.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center sm:text-left">
            Weekly Analysis
          </h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
            {overviewEntries.map(([key, value], index) => (
              <StatsCard
                key={index}
                stat={{
                  label: key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase()),
                  value,
                  change: "",
                  icon: Clock,
                  color: "bg-blue-500",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <TodaysPlan studyPlan={dashboardData?.todayPlan} />
          <UpcomingQuiz upcomingTests={dashboardData?.upcomingTests || []} />
          <StudyProgress
            progress={dashboardData?.progress}
            overview={dashboardData?.overview}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <StudyHoursChart data={dashboardData?.trends?.weeklyStudy || []} />
          <QuizAccuracyChart data={dashboardData?.trends?.quizAccuracy || []} />
        </div>
      </div>
    </div>
  );
};

// ✅ Memoize charts & components if heavy
export default React.memo(Dashboard);