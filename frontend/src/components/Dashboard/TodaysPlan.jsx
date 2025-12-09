import { BookOpen, Calendar, Clock } from "lucide-react";

const TodaysPlan = ({ studyPlan }) => {
  // expect backend: { topics: [], totalHours: X }
  const todayPlan = studyPlan?.topics || [];

  if (!todayPlan.length) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
        <p className="text-gray-500">No plan for today 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-2xl">
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Today's Plan</h2>
          </div>
          <Calendar className="h-5 w-5 text-white opacity-80" />
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {todayPlan.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-800">{item.subject}</p>
                  <p className="text-sm text-gray-600">{item.topic}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg shadow-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodaysPlan;
