import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AtomicRingsLoader from "../components/Loading/AtomicRingsLoader";

function MockTest() {
  const navigate = useNavigate();

  // Get user data - fixed to prevent re-renders
  const getUserData = () => {
    try {
      const storedUser = localStorage.getItem('mongoUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("Loaded user from localStorage:", userData);
        return userData;
      }
    } catch (error) {
      console.error("Error getting user from localStorage:", error);
    }
    
    // Fallback to mock data
    return {
      _id: "68cf88ac170a0712612b2a2c",
      firstName: "Student",
      lastName: "Name", 
      grade: "12",
      targetExam: "JEE",
      stream: "Science"
    };
  };

  const [user] = useState(() => getUserData());
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [preCountdown, setPreCountdown] = useState(0);
  const [showCountdownOverlay, setShowCountdownOverlay] = useState(false);

  // Backend states
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [paperId, setPaperId] = useState(null);
  const [examType, setExamType] = useState(user?.targetExam || "NEET");
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [submissionError, setSubmissionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ✅ Fetch questions from backend - FIXED: only run once
  useEffect(() => {
    // Prevent multiple calls
    if (dataLoaded || loading === false) return;

    const fetchQuestions = async () => {
      setLoading(true);
      const userId = user._id;
      
      console.log("Fetching test for user:", userId);
      
      try {
        const response = await fetch(`http://localhost:5000/api/mock-test?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received data from backend:", data);

        if (!data.sections) {
          setError("No questions returned from server.");
          setLoading(false);
          return;
        }

        setPaperId(data.paperId);
        setExamType(data.examType);
        setSections(data.sections);
        
        // Flatten all questions for linear navigation
        const allQs = data.sections.flatMap(section => section.questions);
        setQuestions(allQs);
        console.log("Questions loaded successfully:", allQs.length);
        
        setDataLoaded(true);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch questions: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user._id, dataLoaded, loading]);

  // Pre-test countdown
  useEffect(() => {
    if (preCountdown <= 0) return;
    const timer = setInterval(() => {
      setPreCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStarted(true);
          setShowCountdownOverlay(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [preCountdown]);

  // Timer for test
  useEffect(() => {
    if (!started || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, submitted]);

  // Update current section based on current question
  useEffect(() => {
    if (sections.length === 0) return;
    
    let cumulativeQuestions = 0;
    for (let i = 0; i < sections.length; i++) {
      cumulativeQuestions += sections[i].questions.length;
      if (currentQ < cumulativeQuestions) {
        setCurrentSection(i);
        break;
      }
    }
  }, [currentQ, sections]);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Get current section info
  const getCurrentSectionInfo = () => {
    if (sections.length === 0) return { name: "", questionInSection: 0, totalInSection: 0 };
    
    let sectionStartIndex = 0;
    for (let i = 0; i < currentSection; i++) {
      sectionStartIndex += sections[i].questions.length;
    }
    
    const questionInSection = currentQ - sectionStartIndex + 1;
    const totalInSection = sections[currentSection].questions.length;
    
    return {
      name: sections[currentSection].name,
      questionInSection,
      totalInSection
    };
  };

  // Calculate statistics for display - FIXED COUNTING
  const calculateStats = () => {
    const correct = questions.filter((q, idx) => 
      selectedOptions[idx] !== undefined && selectedOptions[idx] === q.answer
    ).length;
    
    const wrong = questions.filter((q, idx) => 
      selectedOptions[idx] !== undefined && selectedOptions[idx] !== q.answer
    ).length;
    
    const unanswered = questions.filter((q, idx) => 
      selectedOptions[idx] === undefined
    ).length;
    
    console.log("Stats calculated:", { correct, wrong, unanswered });
    
    return { correct, wrong, unanswered };
  };

  // ✅ Submit answers - backend will calculate score
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionError(null);

    // Set temporary score to 0, will be updated from backend
    setScore(0);
    setSubmitted(true);

    // Send answers to backend
    const answers = {};
    questions.forEach((q, idx) => {
      if (selectedOptions[idx] !== undefined) {
        const optionIndex = q.options.indexOf(selectedOptions[idx]);
        answers[q.id] = optionIndex;
      }
    });

    const userId = user._id;
    
    console.log("Submitting test with data:", {
      paperId,
      examType: examType,
      userId,
      answers
    });

    try {
      const response = await fetch("http://localhost:5000/api/mock-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          examType: examType,
          userId: userId,
          answers,
          startedAt: new Date(Date.now() - timeLeft * 1000).toISOString(),
          finishedAt: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP error! status: ${response.status}`);
      }

      console.log("Submission successful:", data);
      
      // Update score from backend
      if (data.score !== undefined) {
        setScore(data.score);
        // Animate score
        let anim = 0;
        const targetScore = data.score;
        const interval = setInterval(() => {
          anim += Math.ceil(targetScore / 20);
          if (anim >= targetScore) {
            anim = targetScore;
            clearInterval(interval);
          }
          setAnimatedScore(anim);
        }, 20);
      }

      // Merge correct answers from backend into questions
      if (data.questionsWithAnswers) {
        console.log("Received questionsWithAnswers from backend:", data.questionsWithAnswers.length);
        console.log("First question with answer:", data.questionsWithAnswers[0]);
        
        const updatedQuestions = questions.map(q => {
          const qWithAnswer = data.questionsWithAnswers.find(qa => qa.id === q.id);
          if (qWithAnswer) {
            console.log(`Merging answer for question ${q.id}: ${qWithAnswer.answer}`);
          }
          return qWithAnswer ? { ...q, answer: qWithAnswer.answer } : q;
        });
        setQuestions(updatedQuestions);
        console.log("Questions updated with correct answers. First question:", updatedQuestions[0]);
      } else {
        console.error("No questionsWithAnswers in response!");
      }

    } catch (err) {
      console.error("Error submitting test:", err);
      setSubmissionError(`Failed to submit test: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (percent) => {
    const r = Math.round(255 * (1 - percent / 100));
    const g = Math.round(255 * (percent / 100));
    return `rgb(${r},${g},0)`;
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  // ✅ Loading / error states - UPDATED with AtomicRingsLoader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AtomicRingsLoader />
          <div className="mt-4 text-lg text-gray-700">Loading questions...</div>
          <div className="mt-2 text-sm text-gray-600">
            User: {user._id}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 text-red-500">⚠️</div>
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={() => navigate("/dashboard")} 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ✅ Before starting test
  if (!started && preCountdown === 0) {
    const sectionInfo = sections.map(section => (
      `${section.name}: ${section.questions.length} questions`
    )).join(', ');

    return (
      <div className="flex items-center justify-center min-h-screen relative px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200"></div>
        <div className="bg-white text-gray-900 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-6 sm:p-8 md:p-10 max-w-6xl w-full relative z-10 border border-gray-100 mx-2 sm:mx-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Mock Test - {examType}</h1>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Test Instructions</h2>
              <ul className="list-disc list-inside space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                <li>⏱ Duration: <b>3 hours</b></li>
                <li>📝 Total Questions: <b>{questions.length}</b></li>
                <li>📚 Sections: <b>{sectionInfo}</b></li>
                <li>✅ Correct: <b>+4</b>, ❌ Wrong: <b>-1</b>, ⭕ Unanswered: <b>0</b></li>
                <li>⚡ Don't refresh the browser during the test</li>
                <li>📱 Full-screen mode recommended for better experience</li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Student Information</h2>
              <div className="space-y-2 text-sm sm:text-base text-gray-700">
                <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>Grade:</strong> {user?.grade}</p>
                <p><strong>Target Exam:</strong> {examType}</p>
                <p><strong>Stream:</strong> {user?.stream || "Science"}</p>
                <p><strong>Questions Loaded:</strong> {questions.length}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gray-500 text-white text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl hover:scale-105 transition transform duration-200 shadow-lg"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setPreCountdown(3);
                setShowCountdownOverlay(true);
              }}
              className="px-8 py-3 sm:px-14 sm:py-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl hover:scale-105 transition transform duration-200 shadow-lg"
            >
              Start Test Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Test screen
  const sectionInfo = getCurrentSectionInfo();
  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4 relative">
      <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 w-full max-w-6xl mx-2 sm:mx-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="w-full lg:w-auto">
            <h2 className="text-lg sm:text-xl font-semibold">
              Question {currentQ + 1} of {questions.length}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {sectionInfo.name} - Question {sectionInfo.questionInSection} of {sectionInfo.totalInSection}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto justify-between lg:justify-normal">
            <div className="px-3 py-1 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-lg font-mono font-bold text-sm sm:text-base">
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-3 py-1 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm transition-colors whitespace-nowrap"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>

        {/* Submission Error Alert */}
        {submissionError && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm sm:text-base">
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <span>{submissionError}</span>
            </div>
            <button 
              onClick={() => setSubmissionError(null)}
              className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Question Navigation Grid */}
        <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 sm:gap-2 mb-3 sm:mb-4">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQ(index)}
                className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  currentQ === index
                    ? "bg-indigo-600 text-white"
                    : selectedOptions[index] !== undefined
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="mb-4 sm:mb-6">
          <p className="text-base sm:text-lg font-medium mb-4 sm:mb-6 leading-relaxed">
            {questions[currentQ]?.question}
          </p>

          <div className="grid gap-2 sm:gap-3">
            {questions[currentQ]?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setSelectedOptions({ ...selectedOptions, [currentQ]: opt })
                }
                className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-sm sm:text-base ${
                  selectedOptions[currentQ] === opt
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md sm:shadow-lg"
                    : "bg-white border-gray-300 hover:bg-indigo-50 hover:border-indigo-300"
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 sm:mt-8 gap-2 sm:gap-0">
          <button
            onClick={() => setCurrentQ(prev => Math.max(prev - 1, 0))}
            disabled={currentQ === 0}
            className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            Previous
          </button>
          
          <div className="flex gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              Section: {currentSection + 1} of {sections.length}
            </span>
          </div>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ(prev => Math.min(prev + 1, questions.length - 1))}
              className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          )}
        </div>
      </div>

      {/* Countdown overlay */}
      {showCountdownOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="text-6xl sm:text-8xl font-bold text-white mb-3 sm:mb-4 animate-pulse">
              {preCountdown}
            </div>
            <p className="text-white text-lg sm:text-xl">Test starting in...</p>
          </div>
        </div>
      )}

      {/* Result screen */}
      {submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4 md:p-6 z-50 overflow-auto backdrop-blur-sm">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl flex flex-col items-center space-y-6 sm:space-y-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">🎉 Test Submitted!</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 text-center">
              You completed the {examType} mock test. Here is your result.
            </p>

            {submissionError && (
              <div className="w-full p-3 sm:p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm sm:text-base">
                <strong>Note:</strong> {submissionError} Your results are saved locally.
              </div>
            )}

            <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72">
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#e5e7eb"
                  strokeWidth="8%"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke={getScoreColor(
                    Math.round((animatedScore / (questions.length * 4)) * 100)
                  )}
                  strokeWidth="8%"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={
                    2 *
                    Math.PI *
                    45 *
                    (1 -
                      Math.round(
                        (animatedScore / (questions.length * 4)) * 100
                      ) / 100)
                  }
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-600">
                  {animatedScore}
                </p>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
                  {Math.round((animatedScore / (questions.length * 4)) * 100)}%
                </p>
              </div>
            </div>

            {/* Score Breakdown - FIXED COUNTING */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full max-w-xs sm:max-w-md">
              <div className="text-center p-2 sm:p-3 md:p-4 bg-green-50 rounded-lg sm:rounded-xl border border-green-200">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                  {stats.correct}
                </div>
                <div className="text-xs sm:text-sm text-green-700">Correct</div>
              </div>
              <div className="text-center p-2 sm:p-3 md:p-4 bg-red-50 rounded-lg sm:rounded-xl border border-red-200">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
                  {stats.wrong}
                </div>
                <div className="text-xs sm:text-sm text-red-700">Wrong</div>
              </div>
              <div className="text-center p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-600">
                  {stats.unanswered}
                </div>
                <div className="text-xs sm:text-sm text-gray-700">Unanswered</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center w-full max-w-md">
              <button
                onClick={() => navigate("/review", { 
                  state: { 
                    questions, 
                    selectedOptions, 
                    score, 
                    animatedScore, 
                    examType 
                  } 
                })}
                className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
              >
                Review Your Answers
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                Retake Test
              </button>
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockTest;