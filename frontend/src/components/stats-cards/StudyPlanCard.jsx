import React from 'react';
import { BookOpen } from 'lucide-react';

const StudyPlanCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex items-center">
        <BookOpen className="h-8 w-8 text-blue-500" />
        <div className="ml-4">
          <p className="text-lg font-medium text-gray-700">Study Plan</p>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanCard;
