import React, { useState } from 'react';
import StudyCard from './StudyCard';

const CalendarView = ({ studyData, onMarkDone, onTakeQuiz }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      full: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  };

  const getCompletionStats = (subjects) => {
    const completed = subjects.filter(s => s.completed).length;
    const total = subjects.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const selectedDayData = selectedDate 
    ? studyData.find(day => day.date === selectedDate)
    : null;

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Study Calendar
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {studyData.map((day) => {
            const dateInfo = formatDate(day.date);
            const stats = getCompletionStats(day.subjects);
            const isSelected = selectedDate === day.date;
            const isToday = day.date === new Date().toISOString().split('T')[0];
            
            return (
              <div
                key={day.date}
                onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'border-teal-500 bg-teal-50 shadow-lg' 
                    : isToday
                    ? 'border-teal-300 bg-teal-25 hover:border-teal-400'
                    : 'border-gray-200 bg-white hover:border-teal-300'
                }`}
              >
                <div className="text-center">
                  <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                    isSelected || isToday ? 'text-teal-700' : 'text-gray-500'
                  }`}>
                    {dateInfo.weekday}
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${
                    isSelected || isToday ? 'text-teal-900' : 'text-gray-900'
                  }`}>
                    {dateInfo.day}
                  </div>
                  <div className={`text-xs font-medium mb-3 ${
                    isSelected || isToday ? 'text-teal-600' : 'text-gray-600'
                  }`}>
                    {dateInfo.month}
                  </div>
                  
                  {/* Progress Circle */}
                  <div className="relative w-12 h-12 mx-auto">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#14B8A6"
                        strokeWidth="2"
                        strokeDasharray={`${stats.percentage}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs font-bold ${
                        isSelected || isToday ? 'text-teal-700' : 'text-gray-700'
                      }`}>
                        {stats.percentage}%
                      </span>
                    </div>
                  </div>
                  
                  <div className={`text-xs mt-2 ${
                    isSelected || isToday ? 'text-teal-600' : 'text-gray-500'
                  }`}>
                    {stats.completed}/{stats.total} done
                  </div>
                  
                  {isToday && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full">
                        Today
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDayData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Study Plan for {formatDate(selectedDayData.date).full}
          </h3>
          
          <div className="grid gap-6">
            {selectedDayData.subjects.map((study) => (
              <StudyCard
                key={study.id}
                study={study}
                onMarkDone={onMarkDone}
                onTakeQuiz={onTakeQuiz}
              />
            ))}
          </div>
        </div>
      )}

      {!selectedDate && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <svg className="w-16 h-16 text-teal-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Date</h3>
          <p className="text-gray-500">Click on any date above to view your study plan for that day</p>
        </div>
      )}
    </div>
  );
};

export default CalendarView;