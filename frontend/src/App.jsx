// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SnackbarProvider, useSnackbar } from "notistack";
import { setupErrorHandling } from "./utils/errorHandler";

import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Upload from "./pages/Upload.jsx";
import StudyPlan from "./pages/StudyPlan.jsx";
import Quiz from "./pages/Quiz.jsx";
import Progress from "./pages/Progress.jsx";
import Notifications from "./pages/Notifications.jsx";
import Navbar from "./components/Navbar.jsx";
import LoginRegister from "./pages/LoginRegister.jsx";
import ProtectedRoute from "./components/LoginComponents/ProtectedRoute.jsx";
import MockTest from "./pages/MockTest.jsx";
import ReviewPage from "./components/ReviewPage.jsx";
import { FiX } from "react-icons/fi";

// ✅ Persistent Snackbar Component
function ProfileSnackbar({ show }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (show && !shown) {
      enqueueSnackbar(
        (key) => (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              background: "linear-gradient(135deg, #EF4444, #DC2626)", // 🔴 red
              color: "#fff",
              padding: "12px 16px",
              borderRadius: "12px",
              boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
            }}
          >
            <span>Create your profile to unlock all features!</span>
            <button
              onClick={() => closeSnackbar(key)}
              style={{
                marginLeft: "12px",
                color: "#fff",
                fontWeight: "bold",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <FiX size={18} />
            </button>
          </div>
        ),
        {
          variant: "default",
          persist: true, // stays until manually closed
          anchorOrigin: { vertical: "top", horizontal: "center" }, // below navbar
        }
      );
      setShown(true);
    }
  }, [show, shown, enqueueSnackbar, closeSnackbar]);

  return null;
}

export default function App() {
  const location = useLocation();

  React.useEffect(() => {
    setupErrorHandling();
  }, []);

  const hideNavbar = location.pathname === "/login";

  // ✅ Check login status
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!user;

  // ✅ Show snackbar only if profile incomplete AND navbar is visible
  const showSnackbar = !hideNavbar && isLoggedIn && !user?.profileCompleted;

  return (
    <SnackbarProvider maxSnack={3}>
      <div className="min-h-screen w-full bg-gray-50 text-gray-900 overflow-x-hidden">
        {!hideNavbar && <Navbar />}

        {/* ✅ Persistent profile snackbar */}
        {showSnackbar && <ProfileSnackbar show={true} />}

        <main className={!hideNavbar ? "pt-[72px] md:w-full" : ""}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginRegister />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-plan"
              element={
                <ProtectedRoute>
                  <StudyPlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/review" 
              element={
                <ProtectedRoute>
                  <ReviewPage />
                </ProtectedRoute>
              } />
            <Route
              path="/mock-test"
              element={
                <ProtectedRoute>
                  <MockTest />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<div className="text-sm text-gray-500 p-6">Page not found</div>}
            />
          </Routes>
        </main>
      </div>
    </SnackbarProvider>
  );
}
