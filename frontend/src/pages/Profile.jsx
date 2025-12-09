import React, { useState, useEffect } from "react";
import ProfileForm from "../components/profileData/ProfileForm";
import ProfileDisplay from "../components/profileData/ProfileDisplay";
import profileBg from "/images/profile_bg_4.jpg";
import AtomicRingsLoader from "../components/Loading/AtomicRingsLoader";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Get the current user's UID (you might need to adjust this based on your auth setup)
  const getCurrentUserId = () => {
    // This is a placeholder - replace with your actual authentication logic
    // For example, if you're using Firebase Auth: 
    // return auth.currentUser.uid;
    
    // For demo purposes, let's assume we have the UID in localStorage
    return JSON.parse(localStorage.getItem("mongoUser"));;
  };

  // Page loading effect
  useEffect(() => {
    const loadPageContent = async () => {
      try {
        // Check if user data exists
        const userData = getCurrentUserId();
        if (!userData) {
          console.warn("No user data found");
        }

        // Simulate any initial page loading tasks
        await new Promise(resolve => setTimeout(resolve, 300)); // Minimal loading time
        
      } catch (error) {
        console.error("Error during page loading:", error);
      } finally {
        // Page is fully loaded
        setPageLoading(false);
      }
    };

    loadPageContent();
  }, []);

  // Fetch user profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      console.log(userId._id);
      const response = await fetch(`http://localhost:5000/api/users/${userId._id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProfileData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle form submission (update profile)
  const handleFormSubmit = async (data) => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      const response = await fetch(`http://localhost:5000/api/users/${userId._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedData = await response.json();
      setProfileData(updatedData);
      
      // Update localStorage with the new profile data
      localStorage.setItem('mongoUser', JSON.stringify(updatedData));
      console.log("Updated localStorage with new profile data:", updatedData);
      
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle editing the profile
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Show loading animation only during initial page load
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AtomicRingsLoader />
          <div className="mt-4 text-lg text-gray-700">Loading Profile Page...</div>
        </div>
      </div>
    );
  }

  if (loading && !profileData) {
    return (
      <div 
        className="h-screen w-full flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${profileBg})` }}
      >
        <div className="text-center">
          <AtomicRingsLoader />
          <div className="mt-4 text-white text-xl">Loading profile data...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full flex items-start justify-end bg-cover bg-center overflow-y-auto"
      style={{ backgroundImage: `url(${profileBg})` }}
    >
      {/* Right Side - Glassmorphism Form / Profile Display */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex justify-center py-0 mr-1">
        <div className="w-11/12 md:w-5/6 lg:w-3/2 rounded-3xl bg-white/70 border border-white/40 shadow-2xl p-1 px-1 mr-2 min-h-[80vh]">
          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          {isEditing || !profileData ? (
            <ProfileForm 
              onSubmit={handleFormSubmit} 
              onCancel={profileData ? handleCancelEdit : null}
              initialData={profileData}
              loading={loading}
            />
          ) : (
            <ProfileDisplay 
              profileData={profileData} 
              onEdit={handleEdit} 
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;