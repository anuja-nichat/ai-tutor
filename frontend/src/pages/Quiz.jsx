import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ApiService from "../services/api";
// 🎯 Import the custom loader component
import AtomicRingsLoader from "../components/Loading/AtomicRingsLoader.jsx"; 

export default function Quiz() {
  const location = useLocation();

  // ---------- STATE ----------
  const [selectedTopic, setSelectedTopic] = useState(
    location.state?.selectedTopic || null
  );
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ---------- DEBUG: Track answers changes ----------
  useEffect(() => {
    console.log('📊 Answers state updated:', answers);
    console.log('📊 Number of answers:', Object.keys(answers).length);
  }, [answers]);

  // ---------- HELPERS ----------
  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem("mongoUser"));
    return user?._id || null;
  };
  const userId = getCurrentUserId();

  // ---------- FALLBACK TOPIC ----------
  useEffect(() => {
    if (selectedTopic || !userId) {
      setLoading(false);
      return;
    }

    async function fetchFallbackTopic() {
      try {
        setLoading(true);
        const data = await ApiService.getStudyPlan(userId);

        if (data?.studyPlan?.topics?.length) {
          const completedTopic = data.studyPlan.topics.find(
            (t) => t.status === "completed"
          );

          if (completedTopic) {
            const topicId =
              completedTopic.topicId?._id?.toString() ||
              completedTopic.topicId?.toString() ||
              completedTopic._id?.toString();

            setSelectedTopic({
              subject: completedTopic.topicId?.subject || "Physics",
              topic:
                completedTopic.topicId?.topic ||
                completedTopic.topic ||
                "Untitled",
              topicId,
              completed: true,
            });
            setMessage("");
          } else {
            setMessage("⚠ Complete a topic first to take its quiz!");
          }
        }
      } catch (err) {
        console.error("Error loading fallback topic:", err);
        setMessage("⚠ Failed to load study plan");
      } finally {
        setLoading(false);
      }
    }

    fetchFallbackTopic();
  }, [userId, selectedTopic]);

  // ---------- FETCH QUIZ ----------
  useEffect(() => {
    async function fetchQuiz() {
      if (!selectedTopic || !userId) return;

      try {
        setLoading(true);
        setMessage("");

        console.log("Fetching quiz for:", {
          userId,
          subject: selectedTopic.subject,
          topicId: selectedTopic.topicId,
        });

        const quizData = await ApiService.getQuizQuestions(
          userId,
          selectedTopic.subject,
          selectedTopic.topicId.toString()
        );

        console.log("Quiz data received:", quizData);

        if (
          quizData &&
          Array.isArray(quizData.questions) &&
          quizData.questions.length > 0
        ) {
          setQuestions(quizData.questions);
          setMessage("");
        } else {
          setMessage("⚠ No quiz questions available for this topic");
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setMessage("⚠ Failed to fetch quiz questions");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [selectedTopic, userId]);

  // ---------- HANDLERS ----------
  const handleAnswerSelect = useCallback((questionId, option) => {
    console.log('🔵 Answer selected:', { questionId, option });
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: option };
      console.log('🟢 Previous answers:', prev);
      console.log('🟢 New answers:', newAnswers);
      console.log('🟢 Total answered:', Object.keys(newAnswers).length);
      return newAnswers;
    });
  }, []);  const handleQuizSubmit = async () => {
  // extra safety: ensure all questions answered
  if (Object.keys(answers).length !== questions.length) {
    setMessage("⚠ Please answer all questions before submitting!");
    return;
  }

  try {
    setLoading(true);
    setMessage("");

    // call the existing ApiService method
    const res = await ApiService.submitQuiz(
      userId,
      selectedTopic.subject,
      selectedTopic.topicId,
      answers
    );

    // normalize response to what UI expects
    const normalized = {
      score: res.score ?? 0,
      correct: res.correct ?? 0,
      total: res.totalQuestions ?? res.total ?? questions.length,
      details: res.details ?? []
    };

    setResult(normalized);

    // ✅ Auto-mark topic as completed after quiz submission
    try {
      await ApiService.markProgress(userId, selectedTopic.topicId);
      console.log('✅ Topic automatically marked as completed after quiz');
    } catch (markError) {
      console.error('Failed to auto-mark topic as completed:', markError);
      // Don't fail the quiz submission if marking fails
    }
  } catch (err) {
    console.error("Error submitting quiz:", err);
    setMessage("⚠ Failed to submit quiz");
  } finally {
    setLoading(false);
  }
};  const handleQuizRetry = async () => {
    setResult(null);
    setAnswers({});
    setQuestions([]);

    try {
      const quizData = await ApiService.getQuizQuestions(
        userId,
        selectedTopic.subject,
        selectedTopic.topicId.toString()
      );

      if (
        quizData &&
        Array.isArray(quizData.questions) &&
        quizData.questions.length > 0
      ) {
        setQuestions(quizData.questions);
        setMessage("");
      } else {
        setMessage("⚠ No quiz questions available for this topic");
      }
    } catch (err) {
      console.error("Error retrying quiz:", err);
    }
  };

  // ---------- RENDER ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* 🎯 Loading Animation */}
        <AtomicRingsLoader />
      </div>
    );
  }

  if (message && !selectedTopic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-red-600 mb-4">
            {message}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!selectedTopic) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-gray-600">
        No topic selected for quiz
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 md:p-10"
      style={{
        backgroundImage: "url('/images/backgroundimage1.png')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="max-w-5xl mx-auto bg-white p-6 sm:p-8 md:p-12 rounded-3xl shadow-2xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-8 text-center text-indigo-700">
          🚀 {selectedTopic.subject} Quiz – {selectedTopic.topic}
        </h1>

        {message && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
            {message}
          </div>
        )}

        {!result ? (
          <>
            {questions.length === 0 ? (
              <div className="text-center py-8 text-lg text-gray-600">
                No questions available
              </div>
            ) : (
              <>
                {questions.map((q, index) => (
                  <div
                    key={index}
                    className="p-4 sm:p-6 rounded-2xl shadow-md bg-white border border-gray-200 hover:shadow-lg transition w-full mb-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-semibold text-lg sm:text-xl text-gray-800">
                        {index + 1}. {q.question}
                      </p>
                      {answers[index] && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          ✓ Answered
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {q.options.map((opt, optIndex) => (
                        <div
                          key={`${index}-${optIndex}`}
                          onClick={() => handleAnswerSelect(index, opt)}
                          className={`px-4 py-3 sm:px-5 sm:py-4 rounded-xl border cursor-pointer transition transform text-sm sm:text-base ${
                            answers[index] === opt
                              ? "bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm scale-105"
                              : "border-gray-300 hover:bg-gray-50 hover:scale-105"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              answers[index] === opt ? "border-indigo-600" : "border-gray-400"
                            }`}>
                              {answers[index] === opt && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                              )}
                            </div>
                            <span>{opt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(answers).length !== questions.length}
                  className={`w-full py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg transform transition ${
                    Object.keys(answers).length === questions.length
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {Object.keys(answers).length === questions.length
                    ? "✅ Submit Quiz"
                    : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
                </button>
              </>
            )}
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6">
              🎯 Your Score: {result.score}%
            </h2>
            <div className="space-y-6 text-left">
              {result.details.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-4 sm:p-6 rounded-2xl shadow-md border transition ${
                    r.isCorrect
                      ? "bg-green-50 border-green-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <p className="font-semibold mb-3 sm:mb-4 text-gray-800 text-base sm:text-lg">
                    {idx + 1}. {r.question}
                  </p>
                  {r.isCorrect ? (
                    <p className="text-green-700 font-semibold">✅ Correct</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-red-700 font-semibold">❌ Wrong</p>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Your Answer:{" "}
                        <span className="font-semibold">{r.selected}</span>
                      </p>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Correct Answer:{" "}
                        <span className="font-semibold">{r.correctAnswer}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleQuizRetry}
              className="mt-8 sm:mt-10 px-8 sm:px-10 py-3 sm:py-4 bg-gray-800 text-white rounded-2xl shadow-lg font-semibold text-base sm:text-lg hover:bg-gray-900 transform hover:scale-105 transition"
            >
              🔄 Retry Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}