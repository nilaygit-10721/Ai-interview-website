import React from "react";

const Home_tools = () => {
  const tools = [
    {
      title: "Resume Builder",
      description: "Build your resume in one click with our AI.",
    },
    {
      title: "AI Based Interviews",
      description: "Get AI help with interview coaching and resume builder.",
    },
    {
      title: "Cover Letter Generator",
      description:
        "Tailor your cover letter to match your unique skills and experiences.",
    },
    {
      title: "Quiz and Puzzles",
      description:
        "An interview quiz to gauge candidates skills and suitability for a role.",
    },
    {
      title: "Resources",
      description:
        "Access a wealth of information to aid your job search and career development.",
    },
    {
      title: "Career Guidance",
      description:
        "I'm here to help you with your questions and guide you through our services.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* User Profile Header */}
        <div className="flex justify-end items-center mb-8">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            NP
          </div>
          <span className="ml-2 text-gray-700 font-medium">Nilay Patel</span>
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
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {tool.title}
              </h2>
              <p className="text-gray-600 mb-4">{tool.description}</p>
              <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
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
