import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import topics from "./data/topics.json";
const { enqueueSnackbar } = useSnackbar();


export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [preview, setPreview] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  // Restore file from localStorage on mount
  useEffect(() => {
    const savedFile = localStorage.getItem("uploadedFile");
    if (savedFile) {
      const parsed = JSON.parse(savedFile);
      setFile(parsed);
      setUploadedFiles([parsed]);
      setIsUploaded(true);
      setPreview(renderPreview()); // Show preview
    }
  }, []);

  // Render JSX preview from topics.json
  const renderPreview = () => (
    <div>
      <p className="mb-2 text-sm text-emerald-700">Class: {topics.class}</p>
      {Object.entries(topics.subjects).map(([subject, chapters]) => (
        <div key={subject} className="mb-3">
          <h3 className="font-semibold text-emerald-600">{subject}</h3>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {chapters.map((chapter, idx) => (
              <li key={idx}>{chapter}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selected.type) || selected.size > 5 * 1024 * 1024) {
      enqueueSnackbar("⚠️ Only PDF/DOCX under 5MB are allowed!", {
        variant: "error",
        autoHideDuration: 5000,
      });
      setFile(null);
      setPreview(null);
      setIsUploaded(false);
      return;
    }

    const fileData = {
      name: selected.name,
      size: selected.size,
      type: selected.type,
    };

    setFile(fileData);
    setPreview(renderPreview()); // Show preview
    setIsUploaded(false);
  };

  // Handle upload
  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);

    let val = 0;
    const it = setInterval(() => {
      val += 15;
      setProgress(val);
      if (val >= 100) {
        clearInterval(it);
        setIsUploading(false);
        setIsUploaded(true);
        setUploadedFiles((prev) => [...prev, file]);
        localStorage.setItem("uploadedFile", JSON.stringify(file));
        enqueueSnackbar(`🎉 File "${file.name}" uploaded successfully!`, {
          variant: "success",
          autoHideDuration: 5000,
        });
      }
    }, 250);
  };

  // Remove file
  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setPreview(null);
    setIsUploaded(false);
    localStorage.removeItem("uploadedFile");
  };

  return (
    <div className="backdrop-blur-md bg-white/80 shadow-xl rounded-2xl p-6 md:p-8 border border-emerald-100">
      {/* File Upload Input */}
      {!file && (
        <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
          <span className="text-6xl mb-3">📂</span>
          <span className="text-gray-700 font-semibold">
            Click to upload or drag & drop
          </span>
          <span className="text-sm text-gray-500 mt-1">
            (PDF/DOCX only, max 5MB)
          </span>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {/* File Card */}
      {file && (
        <div className="mt-6 bg-white rounded-xl shadow-md p-5 md:p-6 border border-emerald-100 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-lg">
              {file.type === "application/pdf" ? "PDF" : "DOCX"}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                {file.type === "application/pdf" ? "PDF Document" : "Word Document"}
              </p>
            </div>
          </div>

          {/* Progress */}
          {isUploading && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Dynamic Preview */}
          {preview && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
              <h3 className="font-semibold mb-2 text-emerald-700">📖 File Preview</h3>
              {preview}
            </div>
          )}

          {/* Upload & Remove Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 self-end mt-1">
            <button
              onClick={handleUpload}
              disabled={isUploading || isUploaded}
              className={`px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-300 ${
                isUploading || isUploaded
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg"
              }`}
            >
              ⬆️ {isUploading ? "Uploading..." : isUploaded ? "Uploaded" : "Upload"}
            </button>
            <button
              onClick={removeFile}
              disabled={isUploading}
              className={`px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-300 ${
                isUploading
                  ? "bg-gray-200 text-white cursor-not-allowed"
                  : "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              ❌ Remove
            </button>
          </div>
        </div>
      )}

      {/* Matrix/Grid Preview for Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {uploadedFiles.map((f, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 flex flex-col items-center justify-center bg-white shadow-md"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-lg mb-2">
                {f.type === "application/pdf" ? "PDF" : "DOCX"}
              </div>
              <p className="text-sm font-semibold text-center truncate">{f.name}</p>
              <p className="text-xs text-gray-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
