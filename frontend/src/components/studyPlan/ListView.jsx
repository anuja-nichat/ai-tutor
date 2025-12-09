// ListView.jsx - CORRECTED VERSION
import React from 'react';

const ListView = ({ studyData, onMarkDone, onTakeQuiz }) => {
  console.log('ListView studyData:', studyData);

  const handleTakeQuizClick = (topic) => {
    console.log('ListView - Take Quiz clicked for:', {
      topic: topic.topic,
      id: topic.id,
      rawTopicId: topic.rawTopicId
    });
    onTakeQuiz(topic);
  };

  return (
    <div className="space-y-6">
      {studyData.map((day, dayIndex) => (
        <div key={dayIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">{day.date}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {day.subjects.map((subject, subjectIndex) => (
              <div key={subjectIndex} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {subject.subject}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        {subject.duration}
                      </span>
                      {subject.completed && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Completed
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900">{subject.topic}</h4>
                    <p className="text-sm text-gray-600 mt-1">{subject.timeSlot}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onMarkDone(subject.id, !subject.completed)}
                      className={`px-3 py-2 text-xs font-medium rounded ${
                        subject.completed
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {subject.completed ? 'Mark Pending' : 'Mark Completed'}
                    </button>
                    
                    <button
                      onClick={() => handleTakeQuizClick(subject)}
                      className="px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 shadow-md transition-all duration-200"
                    >
                      Take Quiz
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView;