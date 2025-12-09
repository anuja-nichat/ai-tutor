// src/pages/LoginRegister.jsx
import { syncUserWithMongoDB } from "../services/firebaseOffline";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FcGoogle } from "react-icons/fc";

import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  sendPasswordReset,
  getErrorMessage,
} from "../services/firebaseOffline";
import ImageCarousel from "../components/LoginComponents/ImageCarousel";

const LoginRegister = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (activeTab === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (activeTab === 1 && formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  // 🔑 Handle login/signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      if (activeTab === 0) {
        // LOGIN
        console.log("Attempting login with:", formData.email);
        const userCredential = await loginWithEmail(formData.email, formData.password);
        console.log("Login successful:", userCredential.user);
        
        // 🔑 Sync with MongoDB after login
        const mongoUser = await syncUserWithMongoDB(userCredential.user);
        if (mongoUser) {
          localStorage.setItem("mongoUser", JSON.stringify(mongoUser)); // 🔑 Save user
          console.log("MongoDB sync successful after login:", mongoUser);
        }
        
        showSnackbar("🎉 Login successful! Redirecting...", "success");
        navigate("/profile");
      } else {
        // SIGNUP
        console.log("Attempting registration with:", formData.email);
        const userCredential = await registerWithEmail(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );
        console.log("Registration successful:", userCredential.user);
        
        // 🔑 Sync with MongoDB (registerWithEmail already calls sync, but we want the returned object)
        const mongoUser = await syncUserWithMongoDB(userCredential.user, {
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        if (mongoUser) {
          localStorage.setItem("mongoUser", JSON.stringify(mongoUser));
          console.log("MongoDB sync successful after signup:", mongoUser);
        }

        const displayName =
          userCredential.user.displayName ||
          `${formData.firstName} ${formData.lastName}` ||
          userCredential.user.email;

        showSnackbar(`🎉 Account created successfully! Welcome, ${displayName}`, "success");

        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      const errorMessage = getErrorMessage(error.code || error.message);
      showSnackbar(errorMessage, "error");
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setErrors({ email: "Invalid credentials", password: "Invalid credentials" });
      } else if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "This email is already registered" });
      } else if (error.code === "auth/weak-password") {
        setErrors({ password: "Password is too weak" });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Please enter a valid email address" });
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      console.log("Attempting Google sign-in");
      const userCredential = await loginWithGoogle();
      console.log("Google sign-in successful:", userCredential.user);
      
      const mongoUser = await syncUserWithMongoDB(userCredential.user);
      if (mongoUser) {
        localStorage.setItem("mongoUser", JSON.stringify(mongoUser));
        console.log("MongoDB sync successful after Google sign-in:", mongoUser);
      }
      
      const displayName = userCredential.user.displayName || userCredential.user.email || "User";
      showSnackbar(`🎉 Google sign-in successful! Welcome, ${displayName}`, "success");
      navigate("/profile");
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        const errorMessage = getErrorMessage(error.code);
        showSnackbar(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      showSnackbar("Please enter your email address first", "warning");
      return;
    }
    
    try {
      console.log("Sending password reset to:", formData.email);
      await sendPasswordReset(formData.email);
      showSnackbar("✅ Password reset email sent! Check your inbox.", "success");
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage = getErrorMessage(error.code);
      showSnackbar(errorMessage, "error");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 overflow-hidden fixed inset-0">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl h-[90vh]">
        {/* Left side - Image carousel */}
        <div className="lg:w-1/2 h-80 lg:h-full">
          <ImageCarousel />
        </div>

        {/* Right side - Auth form */}
        <div className="lg:w-1/2 flex flex-col justify-center p-6 lg:p-12 h-full">
          <div className="max-w-md mx-auto w-full h-full flex flex-col justify-center">
            <Typography variant="h4" className="font-bold text-slate-800 mb-2 text-center">
              Welcome to AI Tutor
            </Typography>
            <Typography variant="body1" className="text-slate-600 mb-6 text-center">
              {activeTab === 0 ? "Sign in to your account" : "Create your account"}
            </Typography>

            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              className="mb-6"
              sx={{
                "& .MuiTab-root": { textTransform: "none", fontSize: "1rem", fontWeight: 600 },
                "& .MuiTabs-indicator": { backgroundColor: "#2FA86A" },
              }}
            >
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {activeTab === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    fullWidth
                    variant="outlined"
                  />
                  <TextField
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    fullWidth
                    variant="outlined"
                  />
                </div>
              )}

              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                variant="outlined"
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {activeTab === 1 && (
                <TextField
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              {activeTab === 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{ color: "#2FA86A" }}
                      />
                    }
                    label="Remember me"
                  />
                  <Button
                    variant="text"
                    onClick={handleForgotPassword}
                    sx={{
                      color: "#2FA86A",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "rgba(47, 168, 106, 0.04)" },
                    }}
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: "#2FA86A",
                  "&:hover": { backgroundColor: "#268A5A" },
                  py: 1.5,
                  fontSize: "1rem",
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : activeTab === 0 ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleGoogleSignIn}
                disabled={loading}
                startIcon={<FcGoogle />}
                sx={{
                  borderColor: "#E5E7EB",
                  color: "#374151",
                  py: 1.5,
                  fontSize: "1rem",
                  textTransform: "none",
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#2FA86A",
                    backgroundColor: "rgba(47, 168, 106, 0.04)",
                  },
                }}
              >
                Continue with Google
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LoginRegister;
