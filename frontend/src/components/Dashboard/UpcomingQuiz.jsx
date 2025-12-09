import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, AlertCircle } from "lucide-react";

const UpcomingMockTest = ({ upcomingTests }) => {
  const navigate = useNavigate();

  if (!upcomingTests || upcomingTests.length === 0) return null;

  const handleStartTest = (examData) => {
    // Navigate to MockTest page with exam data
    navigate("/mock-test", { 
      state: { 
        examType: examData?.exam,
        duration: examData?.duration,
        sections: examData?.sections
      }
    });
  };

  return (
    <div className="space-y-6">
      {upcomingTests.map((examData, idx) => (
        <div
          key={idx}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-2xl">
                  <Brain className="h-6 w-6 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold text-white">Upcoming Mock Test</h2>
              </div>
              <AlertCircle className="h-5 w-5 text-white opacity-80" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Exam Title */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {examData?.exam} Exam
              </h3>
            </div>

            {/* Exam Details */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Exam</span>
                <span className="text-sm font-semibold text-emerald-600 bg-white px-3 py-1 rounded-full shadow-sm">
                  {examData?.exam}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Duration</span>
                <span className="text-sm font-semibold text-teal-600 bg-white px-3 py-1 rounded-full shadow-sm">
                  {examData?.duration}
                </span>
              </div>
            </div>

            {/* Sections */}
            {examData?.sections?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Sections</h4>
                <div className="space-y-2">
                  {examData.sections.map((subject, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white rounded-xl p-2 shadow-sm border border-gray-100"
                    >
                      <span className="text-sm font-medium text-gray-700">{subject}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start Button */}
            <button 
              onClick={() => handleStartTest(examData)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-4 rounded-2xl font-semibold hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <Brain className="h-5 w-5" />
              <span>Start Test</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingMockTest;