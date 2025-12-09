// src/services/firebaseOffline.js
// Offline-first Firebase configuration with MongoDB synchronization

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";

// 🔑 Firebase config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBJXhSAwUEa0aZY52Gv0wFOc_9VEBER7Uo",
  authDomain: "ai-tutor-42047.firebaseapp.com",
  projectId: "ai-tutor-42047",
  storageBucket: "ai-tutor-42047.firebasestorage.app",
  messagingSenderId: "112185595538",
  appId: "1:112185595538:web:10d53202be537b7435b84b"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export { onAuthStateChanged };
const googleProvider = new GoogleAuthProvider();

// API base URL for MongoDB backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * 🔄 Sync user with MongoDB
 * Called after every login/register
 */
const syncUserWithMongoDB = async (user, extraData = {}) => {
  try {
    const idToken = await user.getIdToken();

    const response = await fetch(`${API_BASE_URL}/users/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(extraData),
    });

    if (!response.ok) {
      throw new Error("Failed to sync user with MongoDB");
    }

    const data = await response.json();
    console.log("✅ Synced user with MongoDB:", data);
    return data; // MongoDB user object
  } catch (error) {
    console.error("❌ MongoDB sync error:", error);
    return null; // allow Firebase auth to still succeed
  }
};

/**
 * 📌 Register user with email & password
 */
export const registerWithEmail = async (firstName, lastName, email, password) => {
  try {
    if (!email || !password) throw new Error("Email and password are required");
    if (!firstName || !lastName) throw new Error("First and last name are required");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set display name
    await updateProfile(user, {
      displayName: `${firstName.trim()} ${lastName.trim()}`,
    }).catch((err) => console.warn("Could not update display name:", err));

    // 🔄 Sync with MongoDB
    await syncUserWithMongoDB(user, { firstName, lastName });

    return userCredential;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};

/**
 * 📌 Login with email & password
 */
export const loginWithEmail = async (email, password) => {
  try {
    if (!email || !password) throw new Error("Email and password are required");

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 🔄 Sync with MongoDB
    await syncUserWithMongoDB(user);

    return userCredential;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

/**
 * 📌 Login with Google
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Split name
    const nameParts = user.displayName?.split(" ") || [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // 🔄 Sync with MongoDB
    await syncUserWithMongoDB(user, { firstName, lastName });

    return result;
  } catch (error) {
    console.error("Google Sign-in Error:", error);
    throw error;
  }
};

/**
 * 📌 Password reset
 */
export const sendPasswordReset = async (email) => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password Reset Error:", error);
    throw error;
  }
};

/**
 * 📌 Logout
 */
export const logout = async () => {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

/**
 * 📌 Fetch user profile from backend MongoDB
 */
export const fetchUserProfile = async (userId) => {
  try {
    const idToken = await auth.currentUser.getIdToken();
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    if (!response.ok) throw new Error("Failed to fetch user profile");

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * 📌 Update user profile in MongoDB
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const idToken = await auth.currentUser.getIdToken();
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error("Failed to update user profile");

    return await response.json();
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * 📌 Friendly Firebase error messages
 */
export const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups for this site.";
    case "auth/cancelled-popup-request":
      return "Another sign-in process is already in progress.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    default:
      return errorCode
        ? `Authentication error: ${errorCode}`
        : "An error occurred. Please try again.";
  }
};

export {syncUserWithMongoDB};
