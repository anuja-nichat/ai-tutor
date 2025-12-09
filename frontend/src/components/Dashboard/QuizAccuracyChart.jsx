import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const QuizAccuracyChart = ({ data = [] }) => {
  // Transform data - group by date and calculate average score per day
  const groupedData = data.reduce((acc, item) => {
    const date = item.date.split(' ').slice(0, 4).join(' '); // Get full date without time
    if (!acc[date]) {
      acc[date] = { date, total: 0, count: 0 };
    }
    acc[date].total += item.score;
    acc[date].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(groupedData).map(item => ({
    date: item.date.split(' ').slice(1, 4).join(' '), // Format as "Sep 19 2025"
    score: Math.round(item.total / item.count)
  }));

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Quiz Accuracy Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#059669' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default QuizAccuracyChart;