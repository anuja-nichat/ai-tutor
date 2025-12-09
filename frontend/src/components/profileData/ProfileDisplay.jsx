const ProfileDisplay = ({ profileData, onEdit, loading }) => {
  if (!profileData) return null;

  const calculateStudyHours = () => {
    if (profileData.dailyStudyHours?.startTime && profileData.dailyStudyHours?.endTime) {
      const start = new Date(`2000-01-01 ${profileData.dailyStudyHours.startTime}`);
      const end = new Date(`2000-01-01 ${profileData.dailyStudyHours.endTime}`);
      const diff = (end - start) / (1000 * 60 * 60);
      return diff > 0 ? diff : 24 + diff;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {profileData ? "Your Profile" : "Profile Created Successfully! 🎉"}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {profileData ? "Here's your study profile" : "Here's your study profile summary"}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 shadow-lg border border-emerald-100">
          {/* Profile Picture and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 mb-8 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-emerald-200 mb-4 sm:mb-0">
              {profileData.profilePicture ? (
                <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl">👨‍🎓</div>
              )}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                {profileData.firstName} {profileData.lastName}
              </h3>
              <p className="text-emerald-600 font-medium text-sm sm:text-base">
                {profileData.grade} • {profileData.stream}
              </p>
              <p className="text-gray-600 text-sm sm:text-base">{profileData.email}</p>
              {profileData.mobileNumber && (
                <p className="text-gray-600 text-sm sm:text-base">📱 {profileData.mobileNumber}</p>
              )}
            </div>
          </div>

          {/* About Me */}
          {profileData.aboutMe && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">About Me</h4>
              <p className="text-gray-700 bg-white p-4 rounded-lg border border-emerald-100 text-sm sm:text-base">
                {profileData.aboutMe}
              </p>
            </div>
          )}

          {/* Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-emerald-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">🎓 Academic Details</h4>
              <div className="space-y-2 text-sm sm:text-base">
                <p><span className="font-medium">Grade:</span> {profileData.grade || 'Not specified'}</p>
                <p><span className="font-medium">Stream:</span> {profileData.stream || 'Not specified'}</p>
                <p><span className="font-medium">Target Exam:</span> {profileData.targetExam || 'Not specified'}</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg border border-emerald-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">⏰ Study Schedule</h4>
              <div className="space-y-2 text-sm sm:text-base">
                <p><span className="font-medium">Start Time:</span> {profileData.dailyStudyHours?.startTime || 'Not set'}</p>
                <p><span className="font-medium">End Time:</span> {profileData.dailyStudyHours?.endTime || 'Not set'}</p>
                <p><span className="font-medium">Daily Hours:</span> {calculateStudyHours().toFixed(1)} hours</p>
              </div>
            </div>
          </div>

          {/* Subjects */}
          {profileData.subjects && profileData.subjects.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">📚 Subjects</h4>
              <div className="flex flex-wrap gap-2">
                {profileData.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Study Progress Visualization */}
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-emerald-100 mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">📊 Study Progress Tracker</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-emerald-50 p-3 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">{calculateStudyHours().toFixed(1)}</div>
                <div className="text-xs sm:text-sm text-gray-600">Daily Hours</div>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-teal-600">{profileData.subjects ? profileData.subjects.length : 0}</div>
                <div className="text-xs sm:text-sm text-gray-600">Subjects</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600">100%</div>
                <div className="text-xs sm:text-sm text-gray-600">Commitment</div>
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-lg text-center mb-6">
            <p className="text-base sm:text-lg font-semibold">🌟 Ready to achieve your dreams!</p>
            <p className="text-xs sm:text-sm opacity-90">Your journey to success starts now. Stay consistent and focused!</p>
          </div>

          {/* Edit Button */}
          <div className="text-center">
            <button
              onClick={onEdit}
              disabled={loading}
              className={`${loading ? 'bg-gray-400' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto text-sm sm:text-base`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>✏️</span>
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDisplay;