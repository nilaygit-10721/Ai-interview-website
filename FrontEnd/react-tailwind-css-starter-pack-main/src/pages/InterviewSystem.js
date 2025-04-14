import { useState, useRef, useEffect } from "react";
import axios from "axios";

const InterviewPage = () => {
  // Interview state
  const [stage, setStage] = useState("setup"); // 'setup', 'interview', 'complete'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversation, setConversation] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);

  // Form data
  const [formData, setFormData] = useState({
    role: "",
    company: "",
    resume: null,
  });

  // Audio handling
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, resume: e.target.files[0] }));
  };

  // Start interview
  const startInterview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("role", formData.role);
      form.append("company", formData.company);
      form.append("resume", formData.resume);

      const response = await axios.post(
        "http://localhost:4000/api/v1/interview",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      const url = URL.createObjectURL(new Blob([response.data]));
      setAudioUrl(url);
      setStage("interview");
      setQuestionCount(1);

      setConversation([
        {
          speaker: "Interviewer",
          text: "Please listen to the first question...",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  // Start recording answer
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setRecordedAudio(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      setConversation((prev) => [
        ...prev,
        {
          speaker: "You",
          text: "Recording answer...",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      setError("Microphone access denied");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!recordedAudio) return;
    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("audio", recordedAudio, "answer.wav");

      const response = await axios.post(
        "http://localhost:4000/api/v1/transcribe",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      const url = URL.createObjectURL(new Blob([response.data]));
      setAudioUrl(url);
      setQuestionCount((prev) => prev + 1);

      setConversation((prev) => [
        ...prev,
        {
          speaker: "You",
          text: "Answer submitted",
          time: new Date().toLocaleTimeString(),
        },
        {
          speaker: "Interviewer",
          text: "Next question ready...",
          time: new Date().toLocaleTimeString(),
        },
      ]);

      setRecordedAudio(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process answer");
    } finally {
      setLoading(false);
    }
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Interview Practice
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Get realistic interview practice with AI
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {stage === "setup" && (
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={startInterview} className="space-y-6">
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Role *
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. Google"
                />
              </div>

              <div>
                <label
                  htmlFor="resume"
                  className="block text-sm font-medium text-gray-700"
                >
                  Upload Resume (PDF) *
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    onChange={handleFileChange}
                    accept=".pdf"
                    required
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Starting Interview...
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {stage === "interview" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Question {questionCount}
              </h2>
            </div>

            <div className="p-6">
              {audioUrl && (
                <div className="mb-6">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    className="w-full"
                    onEnded={() => console.log("Playback finished")}
                  />
                </div>
              )}

              <div className="flex justify-center space-x-4 mb-6">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Record Answer
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Stop Recording
                  </button>
                )}

                {recordedAudio && (
                  <button
                    onClick={submitAnswer}
                    disabled={loading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Processing..." : "Submit Answer"}
                  </button>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Conversation History
                </h3>
                <div className="space-y-4">
                  {conversation.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        item.speaker === "Interviewer"
                          ? "bg-blue-50"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <span
                          className={`text-sm font-medium ${
                            item.speaker === "Interviewer"
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {item.speaker}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "complete" && (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900">
              Interview Complete!
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              You've answered {questionCount} questions. Great job!
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setStage("setup");
                  setConversation([]);
                  setQuestionCount(0);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start New Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
