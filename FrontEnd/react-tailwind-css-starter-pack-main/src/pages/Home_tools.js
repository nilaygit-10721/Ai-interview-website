import React from "react";
import { useNavigate } from "react-router-dom";

const Home_tools = () => {
  const navigate = useNavigate();

  const tools = [
    {
      title: "Resume Builder",
      description: "Build your resume in one click with our AI.",
      path: "/tools/resume",
    },
    {
      title: "AI Based Interviews",
      description: "Get AI help with interview coaching and resume builder.",
      path: "/tools/interview",
    },
    {
      title: "Cover Letter Generator",
      description:
        "Tailor your cover letter to match your unique skills and experiences.",
      path: "/tools/coverletter",
    },
    {
      title: "Quiz and Puzzles",
      description:
        "An interview quiz to gauge candidates skills and suitability for a role.",
      path: "/tools/quiz",
    },
  ];

  const handleExplore = (path) => {
    navigate(path);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Header with Profile Icon */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleProfileClick}
            className="flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-full transition"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="Profile"
              className="w-9 h-9 rounded-full"
            />
          </button>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Interview <span className="text-green-600">Geeks</span>
        </h1>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleExplore(tool.path)}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {tool.title}
              </h2>
              <p className="text-gray-600 mb-4">{tool.description}</p>
              <button
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExplore(tool.path);
                }}
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home_tools;
