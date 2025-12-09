import { useState, useEffect } from "react";

const ProfileForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    profilePicture: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    aboutMe: "",
    grade: "",
    stream: "",
    targetExam: "",
    subjects: [],
    dailyStudyHours: {
      startTime: "",
      endTime: ""
    }
  });

  const [previewImage, setPreviewImage] = useState(null);

  // Initialize form with initialData if provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        profilePicture: initialData.profilePicture || "",
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        mobileNumber: initialData.mobileNumber || "",
        email: initialData.email || "",
        aboutMe: initialData.aboutMe || "",
        grade: initialData.grade || "",
        stream: initialData.stream || "",
        targetExam: initialData.targetExam || "",
        subjects: initialData.subjects || [],
        dailyStudyHours: initialData.dailyStudyHours || { startTime: "", endTime: "" }
      });
      
      if (initialData.profilePicture) {
        setPreviewImage(initialData.profilePicture);
      }
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        subjects: checked
          ? [...prev.subjects, value]
          : prev.subjects.filter((subject) => subject !== value),
      }));
    } else if (name.startsWith("dailyStudyHours.")) {
      // Handle nested dailyStudyHours object
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        dailyStudyHours: {
          ...prev.dailyStudyHours,
          [field]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setFormData((prev) => ({ ...prev, profilePicture: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data for submission (convert to backend format)
    const submitData = {
      ...formData,
      // Ensure dailyStudyHours is properly structured
      dailyStudyHours: {
        startTime: formData.dailyStudyHours.startTime || "",
        endTime: formData.dailyStudyHours.endTime || ""
      }
    };
    
    onSubmit(submitData);
  };

  const subjects = ["Mathematics", "Physics", "Biology", "Chemistry", "Zoology"];
  const grades = ["9", "10", "11", "12", "Other"];
  const streams = ["Science", "Commerce", "Arts", "Other", ""];
  const targetExams = ["JEE", "NEET", "Board", "Other", ""];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-2xl mx-auto mt-12 p-6 sm:p-8 md:p-12 rounded-3xl
                 bg-white/25 backdrop-blur-2xl border border-white/40 shadow-2xl
                 text-gray-800"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {initialData ? "Edit Profile" : "Create Profile"}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Profile Picture Upload */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">Click to upload profile picture</p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">👤 First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Enter your first name"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Enter your last name"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">📱 Mobile Number</label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            placeholder="Enter your mobile number"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">📧 Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* About Me */}
      <div>
        <label className="block text-sm font-medium mb-1">About Me</label>
        <textarea
          name="aboutMe"
          value={formData.aboutMe}
          onChange={handleInputChange}
          placeholder="Tell us about yourself..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 resize-none"
          disabled={loading}
        />
      </div>

      {/* Academic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">🎓 Grade</label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            disabled={loading}
          >
            <option value="">Select your grade</option>
            {grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stream</label>
          <select
            name="stream"
            value={formData.stream}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            disabled={loading}
          >
            <option value="">Select your stream</option>
            {streams.map(stream => (
              <option key={stream} value={stream}>{stream}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Exam */}
      <div>
        <label className="block text-sm font-medium mb-1">🎯 Target Entrance Exam</label>
        <select
          name="targetExam"
          value={formData.targetExam}
          onChange={handleInputChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          disabled={loading}
        >
          <option value="">Select your target exam</option>
          {targetExams.map(exam => (
            <option key={exam} value={exam}>{exam}</option>
          ))}
        </select>
      </div>

      {/* Subjects */}
      <div>
        <label className="block text-sm font-medium mb-2">📚 Subjects</label>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <label
              key={subject}
              className="flex items-center space-x-1 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                value={subject}
                checked={formData.subjects.includes(subject)}
                onChange={handleInputChange}
                className="w-3 h-3 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                disabled={loading}
              />
              <span>{subject}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Study Hours */}
      <div>
        <label className="block text-sm font-medium mb-2">⏰ Daily Study Hours</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Time</label>
            <input
              type="time"
              name="dailyStudyHours.startTime"
              value={formData.dailyStudyHours.startTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Time</label>
            <input
              type="time"
              name="dailyStudyHours.endTime"
              value={formData.dailyStudyHours.endTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full ${loading ? 'bg-gray-400' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{initialData ? "Updating..." : "Creating..."}</span>
          </>
        ) : (
          <>
            <span>🚀</span>
            <span>{initialData ? "Update Profile" : "Create My Profile"}</span>
          </>
        )}
      </button>
    </form>
  );
};

export default ProfileForm;