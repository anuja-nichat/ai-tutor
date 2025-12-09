import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// Import from our robust configuration
import { auth, db, disableFirestore, enableFirestore, isFirestoreAvailable } from "./firebaseConfig";

export { auth, db, onAuthStateChanged };
const googleProvider = new GoogleAuthProvider();

// Helper function to safely execute Firestore operations with aggressive error handling
const safeFirestoreOperation = async (operation, fallback = null, maxRetries = 1) => {
  // Check if Firestore is available
  if (!isFirestoreAvailable()) {
    console.log('Firestore is disabled, skipping operation');
    return fallback;
  }

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Firestore operation attempt ${attempt + 1} failed:`, error);
      
      // Check for WebChannel or network errors
      const isWebChannelError = error.message?.includes('WebChannel') || 
                               error.message?.includes('RPC') ||
                               error.code === 'unavailable' ||
                               error.message?.includes('network');
      
      if (isWebChannelError) {
        console.warn('WebChannel error detected, disabling Firestore temporarily');
        await disableFirestore();
        
        // Try to re-enable after a delay
        setTimeout(async () => {
          try {
            await enableFirestore();
            console.log('Firestore re-enabled after WebChannel error');
          } catch (reEnableError) {
            console.warn('Could not re-enable Firestore:', reEnableError);
          }
        }, 5000);
        
        // Return fallback immediately for WebChannel errors
        return fallback;
      }
      
      // For other errors, try retry if we have attempts left
      if (attempt < maxRetries) {
        console.log(`Retrying in ${(attempt + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
        continue;
      }
      
      break;
    }
  }
  
  console.warn('Firestore operation failed after all retries, using fallback:', lastError);
  return fallback;
};

// Register user with email and password
export const registerWithEmail = async (firstName, lastName, email, password) => {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    if (!firstName || !lastName) {
      throw new Error("First name and last name are required");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, { 
      displayName: `${firstName.trim()} ${lastName.trim()}` 
    });

    // Create user document in Firestore with safe operation (optional)
    safeFirestoreOperation(async () => {
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    }).catch(error => {
      console.warn('User registration succeeded but Firestore write failed:', error);
      // Don't throw - registration should still succeed
    });

    return user;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};

// Login with email and password
export const loginWithEmail = async (email, password) => {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login time in Firestore with safe operation (optional)
    safeFirestoreOperation(async () => {
      await setDoc(doc(db, "users", user.uid), {
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
    }).catch(error => {
      console.warn('Login succeeded but Firestore update failed:', error);
      // Don't throw - login should still succeed
    });

    return userCredential;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

// Login with Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Parse display name
    const nameParts = user.displayName?.split(" ") || [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Create or update user document in Firestore with safe operation (optional)
    safeFirestoreOperation(async () => {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          firstName: firstName,
          lastName: lastName,
          email: user.email || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        },
        { merge: true } // don't overwrite existing data
      );
    }).catch(error => {
      console.warn('Google sign-in succeeded but Firestore write failed:', error);
      // Don't throw - sign-in should still succeed
    });

    return result;
  } catch (error) {
    console.error("Google Sign-in Error:", error);
    throw error;
  }
};

// Password reset
export const sendPasswordReset = async (email) => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password Reset Error:", error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

// Friendly error messages
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
      return errorCode ? `Authentication error: ${errorCode}` : "An error occurred. Please try again.";
  }
};
