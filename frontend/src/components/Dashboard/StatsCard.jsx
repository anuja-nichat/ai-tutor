const StatsCard = ({ stat }) => {
  const Icon = stat.icon;
  return (
    <div className="flex-1 min-w-[250px] bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 group">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}
        >
          <Icon className="text-white" size={24} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
      <p className="text-gray-600 text-sm">{stat.label}</p>
    </div>
  );
};

export default StatsCard;
