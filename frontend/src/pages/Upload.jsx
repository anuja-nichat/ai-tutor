import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AtomicRingsLoader from "../components/Loading/AtomicRingsLoader";

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [parsedSyllabus, setParsedSyllabus] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const images = ["/images/slide1.jpg", "/images/slide2.jpg", "/images/slide3.jpg"];

  const getCurrentUserId = () => {
    return JSON.parse(localStorage.getItem("mongoUser"));
  };

  useEffect(() => {
    // Simulate page loading process
    const loadPageContent = async () => {
      try {
        // Check if user data exists
        const userData = getCurrentUserId();
        if (!userData) {
          console.warn("No user data found");
        }

        // Check for previously uploaded file
        const savedFile = localStorage.getItem("uploadedFile");
        if (savedFile) {
          const parsedFile = JSON.parse(savedFile);
          setFile(parsedFile);
          setUploadedFiles([parsedFile]);
          setSuccess("✅ File restored from local storage.");
        }

        // Simulate any other initial page loading tasks
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading time
        
      } catch (error) {
        console.error("Error during page loading:", error);
      } finally {
        // Page is fully loaded
        setPageLoading(false);
      }
    };

    loadPageContent();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selected.type)) {
      setError("❌ Only PDF and DOCX files are allowed.");
      setFile(null);
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("❌ File size must be less than 5MB.");
      setFile(null);
      return;
    }

    const fileData = {
      fileObject: selected,
      name: selected.name,
      size: selected.size,
      type: selected.type,
    };

    setFile(fileData);
    setError("");
    setSuccess("");
    setShowPreview(false);
  };

  const handleUpload = async () => {
    if (!file || !file.fileObject) {
      setError("❌ Please select a file before uploading.");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setSuccess("");

    const userId = getCurrentUserId()?._id;
    if (!userId) {
      setError("❌ User not found. Please login again.");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file.fileObject);

    try {
      const response = await fetch(
        `http://localhost:5000/api/upload-syllabus/${userId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        // Better error handling
        if (data.error && data.error.includes('Parser service is not running')) {
          throw new Error("The PDF parser service is not running. Please contact support or try again later.");
        }
        throw new Error(data.error || data.details || `Upload failed with status ${response.status}`);
      }
      
      console.log("Actual response from backend:", data);

      let syllabus;

      if (data && data.class && data.subjects && typeof data.subjects === 'object') {
        console.log("Detected multi-subject format.");
        syllabus = {
          class: data.class,
          subjects: data.subjects,
        };
      } 
      else if (data && data.class && data.subject && Array.isArray(data.topics)) {
        console.log("Detected single-subject format. Converting for preview.");
        syllabus = {
          class: data.class,
          subjects: {
            [data.subject]: data.topics 
          },
        };
      } 
      else {
        throw new Error("The parsed data from the backend is not in a recognized format.");
      }

      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 10;
        setProgress(progressValue);
        if (progressValue >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          localStorage.setItem("uploadedFile", JSON.stringify(file));
          setUploadedFiles((prev) => [...prev, file]);
          setSuccess(`✅ File "${file.name}" uploaded successfully!`);
          setParsedSyllabus(syllabus);
          setShowPreview(true);
        }
      }, 100);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(`❌ ${err.message}`);
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    setSuccess("");
    setProgress(0);
    setShowPreview(false);
    setParsedSyllabus(null);
    localStorage.removeItem("uploadedFile");
  };

  const goToStudyPlan = () => {
    navigate("/study-plan");
  };

  // Show loading animation only during initial page load
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AtomicRingsLoader />
          <div className="mt-4 text-lg text-gray-700">Loading Upload Page...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] rounded-xl overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 z-10" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}></div>

      {/* Carousel + Upload box */}
      <div className="relative z-20 max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Carousel */}
          <div className="rounded-2xl overflow-hidden shadow-xl bg-white bg-opacity-80 backdrop-blur-md flex h-full">
            <Slider {...settings} className="w-full h-full">
              {images.map((src, index) => (
                <div key={index} className="flex items-center justify-center w-full h-full">
                  <img src={src} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </Slider>
          </div>

          {/* Upload Section */}
          <div className="flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-2xl shadow-xl h-full">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Upload Your Files</h1>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Upload your syllabus or notes (PDF/DOCX). Your files will be stored securely for generating study plans and quizzes.
            </p>

            <div className="w-full max-w-lg">
              {!file && (
                <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-400 rounded-xl cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:border-indigo-500 hover:shadow-md transition-all duration-300">
                  <span className="text-6xl mb-3">📂</span>
                  <span className="text-gray-700 font-semibold">Click to upload or drag & drop</span>
                  <span className="text-sm text-gray-400 mt-1">(PDF/DOCX only, max 5MB)</span>
                  <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                </label>
              )}

              {error && <p className="text-red-600 font-semibold mt-4 text-center">{error}</p>}
              {success && <p className="text-green-600 font-semibold mt-4 text-center">{success}</p>}

              {file && (
                <div className="mt-6 bg-white rounded-xl shadow-md p-6 border flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 font-bold text-lg">
                      {file.type === "application/pdf" ? "PDF" : "DOCX"}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                        {file.type === "application/pdf" ? "PDF Document" : "Word Document"}
                      </p>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="w-full">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          style={{ width: `${progress}%` }}
                          className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 self-end mt-3">
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md flex items-center gap-2 transition-all duration-300 ${
                        isUploading
                          ? "bg-gray-300 text-white cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:shadow-lg hover:scale-105"
                      }`}
                    >
                      ⬆ {isUploading ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      onClick={removeFile}
                      disabled={isUploading}
                      className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md flex items-center gap-2 transition-all duration-300 ${
                        isUploading
                          ? "bg-gray-200 text-white cursor-not-allowed"
                          : "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:scale-105"
                      }`}
                    >
                      ❌ Remove
                    </button>
                  </div>

                  {success && !isUploading && (
                    <button
                      onClick={goToStudyPlan}
                      className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300"
                    >
                      View Study Plan
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Preview Section - Updated with Four Boxes */}
        {showPreview && parsedSyllabus && (
          <div className="mt-12 p-8 bg-white bg-opacity-95 backdrop-blur-md rounded-2xl shadow-xl">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">📚</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Syllabus Preview</h2>
                {parsedSyllabus.class && (
                  <p className="text-gray-600 font-medium">Class: {parsedSyllabus.class}</p>
                )}
              </div>
            </div>
            
            {/* Four subject boxes in a 2x2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Physics Box */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Physics</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {parsedSyllabus.subjects.Physics && parsedSyllabus.subjects.Physics.slice(0, 4).map((topic, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                  {(!parsedSyllabus.subjects.Physics || parsedSyllabus.subjects.Physics.length === 0) && (
                    <li className="text-gray-500 italic">No physics topics found</li>
                  )}
                </ul>
              </div>

              {/* Math Box */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Math</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {(parsedSyllabus.subjects.Math || parsedSyllabus.subjects.Mathematics) && 
                   (parsedSyllabus.subjects.Math || parsedSyllabus.subjects.Mathematics).slice(0, 4).map((topic, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                  {(!parsedSyllabus.subjects.Math && !parsedSyllabus.subjects.Mathematics) && (
                    <li className="text-gray-500 italic">No math topics found</li>
                  )}
                </ul>
              </div>

              {/* Chemistry Box */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Chemistry</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {parsedSyllabus.subjects.Chemistry && parsedSyllabus.subjects.Chemistry.slice(0, 4).map((topic, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                  {(!parsedSyllabus.subjects.Chemistry || parsedSyllabus.subjects.Chemistry.length === 0) && (
                    <li className="text-gray-500 italic">No chemistry topics found</li>
                  )}
                </ul>
              </div>

              {/* Biology Box */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Biology</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {parsedSyllabus.subjects.Biology && parsedSyllabus.subjects.Biology.slice(0, 4).map((topic, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                  {(!parsedSyllabus.subjects.Biology || parsedSyllabus.subjects.Biology.length === 0) && (
                    <li className="text-gray-500 italic">No biology topics found</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}