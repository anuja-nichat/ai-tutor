import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance for notifications
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class ApiService {
  // ========== STUDY PLAN METHODS ==========
  async getStudyPlan(userId) {
    try {
      console.log('Fetching study plan for user:', userId);
      const response = await fetch(`${API_BASE_URL}/study-plan/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch study plan: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Study plan data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching study plan:', error);
      return this.getMockStudyPlan(); // fallback mock data
    }
  }

  async markProgress(userId, topicId) {
    try {
      console.log('Marking topic as completed:', topicId);
      const response = await fetch(`${API_BASE_URL}/study-plan/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topicId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update progress: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Progress updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error; // propagate to frontend
    }
  }

  async markPending(userId, topicId) {
    try {
      const response = await fetch(`${API_BASE_URL}/study-plan/pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topicId }),
      });

      if (!response.ok) throw new Error('Failed to mark topic pending');

      return await response.json();
    } catch (error) {
      console.error('Error marking topic pending:', error);
      return { success: true, message: 'Topic marked pending successfully' };
    }
  }

  // ========== QUIZ METHODS ==========
  async getQuizQuestions(userId, subject, topicId) {
    try {
      console.log('Fetching quiz for:', { userId, subject, topicId });
      
      const response = await fetch(
        `${API_BASE_URL}/quiz?userId=${userId}&subject=${subject}&topicId=${topicId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Quiz API Error:', response.status, errorText);
        throw new Error(`Failed to fetch quiz: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Quiz API Response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      // Return fallback questions with proper structure
      return this.getMockQuizQuestions(subject, topicId);
    }
  }

  // FIXED: Submit quiz with correct parameters
  async submitQuiz(userId, subject, topicId, answers) {
    try {
      console.log('Submitting quiz:', { userId, subject, topicId, answers });
      
      const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subject,
          topicId,
          answers
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit quiz: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return this.getMockQuizResult(answers, topicId);
    }
  }

  // ========== NOTIFICATION METHODS ==========
  async getNotifications(userId) {
    try {
      if (!userId) {
        console.warn("UserId is required for fetching notifications");
        return [];
      }
      
      const response = await apiClient.get(`/api/notifications/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      
      // Return demo notifications as fallback
      if (error.response?.status === 404) {
        console.warn("User notifications not found, returning demo data");
        return this.getDemoNotifications();
      }
      
      return this.getDemoNotifications();
    }
  }

  async markNotificationRead(notificationId) {
    try {
      if (!notificationId) {
        throw new Error("NotificationId is required");
      }
      
      const response = await apiClient.post(`/api/notifications/mark-read/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Don't throw error - UI updates optimistically
      return { success: false, error: error.message };
    }
  }

  async markAllNotificationsRead(userId) {
    try {
      if (!userId) {
        throw new Error("UserId is required");
      }
      
      const response = await apiClient.post(`/api/notifications/mark-all-read/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      if (!notificationId) {
        throw new Error("NotificationId is required");
      }
      
      const response = await apiClient.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // ========== MOCK DATA METHODS ==========
  getMockQuizQuestions(subject) {
    return {
      subject: subject,
      questions: [
        {
          id: 1,
          question: "What is the SI unit of velocity?",
          options: ["m/s", "km/h", "N", "J"]
        },
        {
          id: 2,
          question: "Which of these is a scalar quantity?",
          options: ["Velocity", "Displacement", "Speed", "Acceleration"]
        }
      ],
      totalQuestions: 2
    };
  }

  getMockQuizResult(answers) {
    const totalQuestions = Object.keys(answers).length;
    const score = Math.floor(Math.random() * totalQuestions) + 1;
    return {
      score: Math.round((score / totalQuestions) * 100),
      correctAnswers: score,
      totalQuestions: totalQuestions,
      results: []
    };
  }

  getMockStudyPlan() {
    const today = new Date();
    const dates = [];
    
    // Generate 7 days of study plan
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return {
      userId: 'user123',
      studyPlan: dates.map((date, index) => ({
        date,
        subjects: [
          {
            id: `physics_${date}`,
            subject: 'Physics',
            topic: index % 2 === 0 ? 'Mechanics - Motion in Straight Line' : 'Thermodynamics - Laws of Thermodynamics',
            duration: '2 hours',
            timeSlot: '09:00 - 11:00',
            completed: false,
            difficulty: index % 3 === 0 ? 'Hard' : index % 2 === 0 ? 'Medium' : 'Easy',
            examType: 'JEE'
          },
          {
            id: `chemistry_${date}`,
            subject: 'Chemistry',
            topic: index % 2 === 0 ? 'Organic Chemistry - Hydrocarbons' : 'Physical Chemistry - Atomic Structure',
            duration: '1.5 hours',
            timeSlot: '11:30 - 13:00',
            completed: false,
            difficulty: index % 3 === 0 ? 'Medium' : 'Hard',
            examType: 'JEE'
          },
          {
            id: `biology_${date}`,
            subject: 'Biology',
            topic: index % 2 === 0 ? 'Human Physiology - Circulatory System' : 'Plant Physiology - Photosynthesis',
            duration: '2 hours',
            timeSlot: '14:00 - 16:00',
            completed: false,
            difficulty: 'Medium',
            examType: 'NEET'
          },
          {
            id: `mathematics_${date}`,
            subject: 'Mathematics',
            topic: index % 2 === 0 ? 'Calculus - Differentiation' : 'Algebra - Quadratic Equations',
            duration: '1.5 hours',
            timeSlot: '16:30 - 18:00',
            completed: false,
            difficulty: index % 3 === 0 ? 'Hard' : 'Medium',
            examType: 'JEE'
          }
        ]
      }))
    };
  }

  getDemoNotifications() {
    return [
      {
        _id: '1',
        userId: 'demo-user',
        type: 'Reminder',
        title: 'Upcoming Quiz: Physics — Motion',
        message: 'Practice kinematics and graphs. Quiz opens tomorrow 7:00 PM.',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'upcoming'
      },
      {
        _id: '2',
        userId: 'demo-user', 
        type: 'Reminder',
        title: 'Daily Plan: Chemistry Sprint',
        message: 'Finish Organic Chemistry — Hydrocarbons (40 mins) + 20 MCQs.',
        read: false,
        createdAt: new Date().toISOString(),
        category: 'dailyPlan'
      },
      {
        _id: '3',
        userId: 'demo-user',
        type: 'Alert', 
        title: 'Performance Alert',
        message: 'Revise Physics: Motion, your last score was low (48%).',
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        category: 'performance'
      },
      {
        _id: '4',
        userId: 'demo-user',
        type: 'Reminder',
        title: 'Upcoming Test: Biology — Human Physiology',
        message: 'Sectional test on Sat 10:00 AM. Syllabus: Digestion & Absorption.',
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'upcoming'
      },
      {
        _id: '5',
        userId: 'demo-user',
        type: 'Reminder',
        title: 'Daily Plan: Math Practice',
        message: 'Conic Sections: Focus on Parabola + 25 timed questions.',
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'dailyPlan'
      }
    ];
  }
}

// Export individual functions for compatibility
export const fetchNotifications = async (userId) => {
  const apiService = new ApiService();
  return await apiService.getNotifications(userId);
};

export const markNotificationRead = async (notificationId) => {
  const apiService = new ApiService();
  return await apiService.markNotificationRead(notificationId);
};

export const markAllNotificationsRead = async (userId) => {
  const apiService = new ApiService();
  return await apiService.markAllNotificationsRead(userId);
};

export default new ApiService();