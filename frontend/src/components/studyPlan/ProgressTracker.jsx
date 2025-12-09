import React from 'react';

const ProgressTracker = ({ studyData }) => {
  const calculateOverallStats = () => {
    let totalSubjects = 0;
    let completedSubjects = 0;
    let totalHours = 0;
    let completedHours = 0;
    const subjectStats = {};

    studyData.forEach(day => {
      day.subjects.forEach(subject => {
        totalSubjects++;
        const hours = parseFloat(subject.duration.match(/[\d.]+/)[0]);
        totalHours += hours;

        if (subject.completed) {
          completedSubjects++;
          completedHours += hours;
        }

        // Track by subject
        if (!subjectStats[subject.subject]) {
          subjectStats[subject.subject] = { total: 0, completed: 0, hours: 0, completedHours: 0 };
        }
        subjectStats[subject.subject].total++;
        subjectStats[subject.subject].hours += hours;
        if (subject.completed) {
          subjectStats[subject.subject].completed++;
          subjectStats[subject.subject].completedHours += hours;
        }
      });
    });

    return {
      overall: {
        totalSubjects,
        completedSubjects,
        totalHours,
        completedHours,
        completionPercentage: Math.round((completedSubjects / totalSubjects) * 100),
        hoursPercentage: Math.round((completedHours / totalHours) * 100)
      },
      subjects: subjectStats
    };
  };

  const stats = calculateOverallStats();

  const getSubjectIcon = (subject) => {
    const icons = {
      Physics: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      Chemistry: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      Biology: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      Mathematics: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    };
    return icons[subject] || icons.Mathematics;
  };

  const getSubjectColor = (subject) => {
    const colors = {
      Physics: 'from-blue-500 to-blue-600',
      Chemistry: 'from-green-500 to-green-600',
      Biology: 'from-purple-500 to-purple-600',
      Mathematics: 'from-red-500 to-red-600'
    };
    return colors[subject] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
          </svg>
          Overall Progress
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-600 text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold text-teal-900">{stats.overall.completionPercentage}%</p>
              </div>
              <div className="text-teal-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tasks Completed</p>
                <p className="text-2xl font-bold text-blue-900">{stats.overall.completedSubjects}/{stats.overall.totalSubjects}</p>
              </div>
              <div className="text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Hours Progress</p>
                <p className="text-2xl font-bold text-green-900">{stats.overall.hoursPercentage}%</p>
              </div>
              <div className="text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Study Hours</p>
                <p className="text-2xl font-bold text-purple-900">{stats.overall.completedHours.toFixed(1)}h</p>
              </div>
              <div className="text-purple-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Progress */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Subject-wise Progress</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(stats.subjects).map(([subject, data]) => {
            const completionRate = Math.round((data.completed / data.total) * 100);
            const hoursRate = Math.round((data.completedHours / data.hours) * 100);
            
            return (
              <div key={subject} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getSubjectColor(subject)} text-white`}>
                    {getSubjectIcon(subject)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{subject}</h4>
                    <p className="text-sm text-gray-600">{data.completed}/{data.total} topics completed</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Task Progress</span>
                      <span className="font-medium text-gray-900">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getSubjectColor(subject)}`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Hours Progress</span>
                      <span className="font-medium text-gray-900">{data.completedHours.toFixed(1)}h / {data.hours.toFixed(1)}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getSubjectColor(subject)} opacity-70`}
                        style={{ width: `${hoursRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;