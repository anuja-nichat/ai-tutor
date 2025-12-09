export function mapBackendToUI(data) {
  if (!data) return [];

  // Handle mock data format (has studyPlan array)
  if (data.studyPlan && Array.isArray(data.studyPlan)) {
    return data.studyPlan;
  }

  // Handle backend API format (has tasks array)
  if (data.tasks || data.date) {
    const date = data.date ? data.date.split("T")[0] : new Date().toISOString().split("T")[0];
    const subjects = (data.tasks || []).map(task => ({
      id: task._id || task.id,
      subject: task.subject,
      topic: task.topic || "N/A",
      duration: task.durationMinutes ? `${task.durationMinutes} min` : "60 min",
      timeSlot: `${task.startTime || "09:00"} - ${task.endTime || "10:00"}`,
      completed: (task.status || "").toLowerCase() === "completed",
      difficulty: task.difficultyLevel || task.difficulty || "Medium",
      examType: task.examType || "JEE/NEET"
    }));

    return [{ date, subjects }];
  }

  // Fallback - return empty array
  return [];
}