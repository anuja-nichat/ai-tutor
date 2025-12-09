import React from 'react';
import { TrendingUp } from 'lucide-react';

const ProgressCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
      <div className="flex items-center">
        <TrendingUp className="h-8 w-8 text-purple-500" />
        <div className="ml-4">
          <p className="text-lg font-medium text-gray-700">Progress</p>
          <p className="text-2xl font-bold text-gray-900">85%</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
