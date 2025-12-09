import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { auth, logout } from "../../services/firebaseOffline";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for user authentication state
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/"); // redirect to login if not logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/"); // go back to login/register page
  };

  if (!user) return null;

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 8,
        p: 4,
        border: "1px solid #ccc",
        borderRadius: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="h5" gutterBottom>
        👋 Welcome, {user.displayName || "User"}!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Email: {user.email}
      </Typography>

      <Button
        variant="contained"
        color="error"
        sx={{ mt: 3 }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Box>
  );
}
