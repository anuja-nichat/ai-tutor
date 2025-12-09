const API_BASE_URL = 'http://localhost:5000';

export async function fetchNotifications(userId) {
  try {
    // FIX 1: The URL now correctly points to your backend server.
    const res = await fetch(`${API_BASE_URL}/notifications/${userId}`);
    
    if (!res.ok) {
        console.error('API call failed, falling back to mock data.');
        throw new Error('API not ok');
    }
    const data = await res.json();
    // The data is passed to the "translator" function below.
    return normalize(data);
  } catch (e) {
    // If the server is down, it will use mock data as a backup.
    return normalize(mockData());
  }
}

// FIX 2: This is the "Translator" function.
// It takes data in your backend's format and reshapes it
// into the "flat" format that Notifications.jsx expects.
function normalize(backendData) {
  return (backendData || []).map(notification => {
    
    // Translates 'category' (backend) to 'type' (frontend)
    const typeMap = {
      'plan': 'dailyPlan',
      'upcoming': 'upcoming',
      'performance': 'performance'
    };

    return {
      id: notification._id, // Uses the backend's _id
      type: typeMap[notification.category] || notification.category,
      title: notification.title,
      message: notification.message,
      // "Flattens" the nested meta object from your backend
      subject: notification.meta?.subject || '',
      topic: notification.meta?.topic || '',
      date: notification.meta?.date || '',
      time: notification.meta?.time || '',
      createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date(),
      read: Boolean(notification.read),
      cta: notification.cta || null,
    };
  });
}

function mockData() {
  const now = Date.now();
  return [
    {
      id: 'd1',
      type: 'dailyPlan',
      title: 'Daily Plan: Chemistry Sprint',
      message: 'Finish Organic Chemistry — Hydrocarbons (40 mins) + 20 MCQs.',
      subject: 'Chemistry',
      topic: 'Hydrocarbons',
      date: 'Today',
      createdAt: now - 1000 * 60 * 60 * 2,
      read: false,
    },
    {
      id: 'u1',
      type: 'upcoming',
      title: 'Upcoming Quiz: Physics — Motion',
      message: 'Practice kinematics and graphs. Quiz opens tomorrow 7:00 PM.',
      subject: 'Physics',
      topic: 'Motion',
      date: 'Tue',
      time: '7:00 PM',
      createdAt: now - 1000 * 60 * 60,
      cta: { label: 'Revise Now', url: '#' },
      read: false,
    },
    {
      id: 'p1',
      type: 'performance',
      title: 'Revise Physics: Motion',
      message: 'Your last score was low. Focus 30 mins on problem types.',
      subject: 'Physics',
      topic: 'Motion',
      createdAt: now - 1000 * 60 * 30,
      read: false,
    },
    {
      id: 'u2',
      type: 'upcoming',
      title: 'Upcoming Test: Organic Chemistry',
      message: 'Unit test on Alkanes and Alkenes this Friday 5:00 PM.',
      subject: 'Chemistry',
      topic: 'Alkanes & Alkenes',
      date: 'Fri',
      time: '5:00 PM',
      createdAt: now - 1000 * 60 * 15,
      read: true,
    },
  ];
}

function cryptoRandomId() {
  try {
    return crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
  } catch {
    return Math.random().toString(16).slice(2);
  }
}


