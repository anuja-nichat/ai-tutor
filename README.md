# 🎓 AI Tutor - Personalized Study Planning Platform

An **AI-powered study planning platform** that helps students prepare for JEE, NEET, and Board exams with personalized study plans, AI-generated quizzes, and comprehensive mock tests.

## ✨ Features

### 📚 Study Management
- **PDF Syllabus Upload** - Parse and extract topics from syllabus PDFs
- **Multi-Subject Support** - Physics, Chemistry, Mathematics/Biology
- **Personalized Study Plans** - Calendar and list view with topic tracking
- **Progress Tracking** - Mark topics as completed and track study hours

### 🎯 Assessment Tools
- **AI-Generated Quizzes** - Topic-wise quizzes with instant feedback
- **Mock Tests** - Full-length practice tests for JEE/NEET/Board exams
- **Smart Scoring** - +4 for correct, -1 for wrong, 0 for unanswered
- **Detailed Review** - Question-wise analysis with correct answers

### 👤 User Features
- **Firebase Authentication** - Google Sign-In integration
- **User Profiles** - Personalized dashboard with study statistics
- **Notifications** - Track upcoming quizzes and study reminders
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

---

## 🏗️ Architecture

### System Components

```
AI-TUTOR/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API server
├── parser-service/    # Python Flask PDF parser
└── documents/         # Sample PDFs and documentation
```

### Tech Stack

**Frontend:**
- React 18.3 with React Router
- Tailwind CSS for styling
- Firebase Authentication
- Vite for fast builds

**Backend:**
- Node.js + Express
- MongoDB with Mongoose ODM
- JWT authentication
- RESTful API architecture

**Parser Service:**
- Python Flask server
- PyMuPDF for PDF parsing
- spaCy for NLP
- Sentence Transformers for embeddings
- OpenAI GPT for quiz generation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MongoDB 6.0+
- Git

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd AI-TUTOR
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/ai-tutor
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

Start backend:
```bash
npm start
```
Backend runs on **http://localhost:5000**

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start frontend:
```bash
npm run dev
```
Frontend runs on **http://localhost:5173**

### 4️⃣ Parser Service Setup

```bash
cd parser-service
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

Create `parser-service/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
FLASK_APP=main.py
```

Start parser service:
```bash
python -m flask run --port=5001
```
Parser service runs on **http://localhost:5001**

---

## 📖 API Documentation

### Backend Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Study Plans
- `GET /api/study-plan/:userId` - Get user's study plan
- `POST /api/study-plan` - Create study plan
- `PUT /api/study-plan/:id` - Update study plan

#### Quizzes
- `GET /api/quiz?userId=&subject=&topicId=` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answers

#### Mock Tests
- `GET /api/mock-test?userId=` - Get mock test paper
- `POST /api/mock-test/submit` - Submit mock test

#### Progress Tracking
- `POST /api/progress/mark` - Mark topic as completed
- `GET /api/progress/:userId` - Get user progress

#### File Upload
- `POST /api/upload` - Upload syllabus PDF

### Parser Service Endpoints

- `POST /parse` - Parse PDF and extract topics
  ```json
  {
    "file": "<binary_pdf_data>"
  }
  ```

- `POST /generate_quiz` - Generate AI quiz
  ```json
  {
    "topic": "Newton's Laws of Motion",
    "subject": "Physics"
  }
  ```

---

## 🗂️ Database Schema

### Collections

**Users**
```javascript
{
  _id: ObjectId,
  email: String,
  firstName: String,
  lastName: String,
  grade: String,
  targetExam: String, // "JEE" | "NEET" | "Board"
  stream: String
}
```

**StudyPlan**
```javascript
{
  userId: ObjectId,
  subjects: [String],
  topics: [{
    topicId: ObjectId,
    subject: String,
    topic: String,
    day: Number,
    status: String // "not-started" | "in-progress" | "completed"
  }]
}
```

**Quiz**
```javascript
{
  topicId: ObjectId,
  subject: String,
  questions: [{
    questionId: String,
    question: String,
    options: [String],
    answer: String
  }],
  generatedAt: Date
}
```

**TestPaper**
```javascript
{
  paperId: String,
  examType: String,
  sections: [{
    name: String,
    subject: String,
    questions: [{
      id: String,
      question: String,
      options: [String],
      answer: String,
      difficulty: String
    }]
  }]
}
```

---

## 🎯 Key Features Explained

### 1. PDF Syllabus Parsing
- Extracts topics from uploaded PDF syllabi
- Detects subjects (Physics, Chemistry, Math/Biology)
- Identifies chapter structure and subtopics
- Generates vector embeddings for topic matching

### 2. Personalized Study Plans
- Auto-generates daily study schedules
- Distributes topics across available days
- Tracks completion status for each topic
- Calendar and list view interfaces

### 3. AI Quiz Generation
- Generates topic-specific MCQ questions
- Uses OpenAI GPT for question creation
- Caches quizzes in database for reuse
- Provides instant feedback and scoring

### 4. Mock Test System
- Full-length practice tests (65 questions)
- Exam-specific question pools (JEE/NEET/Board)
- 3-hour timed tests with countdown
- Section-wise navigation
- Detailed answer review with correct/wrong highlighting

### 5. Progress Tracking
- Visual progress indicators
- Study hours calculation
- Quiz accuracy charts
- Topic completion tracking

---

## 🔒 Security

- ✅ `.env` files excluded from Git via `.gitignore`
- ✅ Firebase Authentication for secure login
- ✅ JWT tokens for API authentication
- ✅ MongoDB connection strings secured
- ✅ API keys stored in environment variables

**Important:** Never commit `.env` files to version control!

---

## 🛠️ Development

### Running in Development Mode

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Terminal 3 - Parser Service
cd parser-service
python -m flask run --port=5001
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm run build  # If TypeScript
```

---

## 📝 Environment Variables Reference

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ai-tutor
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Parser Service (.env)
```env
OPENAI_API_KEY=sk-...
FLASK_APP=main.py
FLASK_ENV=development
```

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
# Ensure MongoDB is running
mongod --dbpath /path/to/data
```

**Parser Service Import Error:**
```bash
# Reinstall dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

**Frontend CORS Error:**
- Check backend CORS configuration
- Ensure `VITE_API_URL` matches backend port

**Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Your Name** - Initial work

---

## 🙏 Acknowledgments

- OpenAI for GPT API
- Firebase for authentication
- MongoDB for database
- React and Vite communities

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: your.email@example.com

---

**Made with ❤️ for students preparing for competitive exams**
