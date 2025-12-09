import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudyHoursChart = ({ data = [] }) => {
  // Transform data for the chart
  const chartData = data.map(item => ({
    day: item.date.split(' ')[0], // Get just the day name
    hours: item.hours
  }));

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Study Hours</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudyHoursChart;