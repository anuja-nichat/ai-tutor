import { useState, useEffect } from "react";

const IllustrationPanel = () => {
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationClass("animate-pulse");
      setTimeout(() => setAnimationClass(""), 2000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full bg-emerald-500 overflow-hidden flex flex-col">
      {/* Background Study Illustration */}
      <div className="absolute inset-0 opacity-15">
        <img
          src="/assets/images/student-illustration-final.jpeg"
          alt="Study Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-emerald-500/30"></div>

      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative z-10">
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-sm sm:text-lg">📊</span>
        </div>
        <div className="absolute top-6 right-6 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-xs sm:text-sm">⭐</span>
        </div>

        {/* Main motivational text */}
        <div className="text-center mb-6 sm:mb-8 px-4">
          <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
            You've Got This! 🌟
          </h2>
          <p className="text-xs sm:text-sm opacity-90">
            Great achievement starts with a decision to try
          </p>
        </div>
      </div>

      {/* Middle Section with Illustration */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className={`relative ${animationClass}`}>
          <div className="w-32 h-32 sm:w-48 sm:h-48 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-4 border-white/50 relative">
            <img
              src="/assets/images/student-illustration-final.jpeg"
              alt="Studying Students"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Decorative star */}
          <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-6 h-6 sm:w-8 sm:h-8 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs sm:text-sm">⭐</span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative z-10">
        {/* Study group illustration */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex justify-center space-x-2 sm:space-x-3">
            {["👨‍🎓", "👩‍🎓", "👨‍💻", "👩‍💻"].map((icon, idx) => (
              <div
                key={idx}
                className="w-8 h-8 sm:w-12 sm:h-12 bg-white/30 rounded-full flex items-center justify-center"
              >
                <span className="text-base sm:text-lg">{icon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational messages */}
        <div className="space-y-1 sm:space-y-2 text-center text-xs sm:text-sm">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <span className="text-red-300">📌</span>
            <span>Study Smart</span>
          </div>
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <span className="text-blue-300">🎯</span>
            <span>Aim High</span>
          </div>
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <span className="text-yellow-300">🏆</span>
            <span>Achieve Excellence</span>
          </div>
        </div>
      </div>

      {/* Decorative background rings */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-1/4 w-14 h-14 sm:w-20 sm:h-20 border-2 border-white rounded-full animate-ping"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-12 h-12 sm:w-16 sm:h-16 border-2 border-white rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    </div>
  );
};

export default IllustrationPanel;
