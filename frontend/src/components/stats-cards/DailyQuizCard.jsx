import React from 'react';
import { Brain } from 'lucide-react';

const DailyQuizCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <div className="flex items-center">
        <Brain className="h-8 w-8 text-green-500" />
        <div className="ml-4">
          <p className="text-lg font-medium text-gray-700">Daily Quizzes Completed</p>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
      </div>
    </div>
  );
};

export default DailyQuizCard;
