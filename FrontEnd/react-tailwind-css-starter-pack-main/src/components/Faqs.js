import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqs = [
  {
    question: "What is Interview Geeks?",
    answer:
      "Interview Geeks is an AI-powered platform designed to help you excel in interviews with quizzes, resources, and resume-building tools.",
  },
  {
    question: "How can Interview Geeks improve my resume?",
    answer:
      "Our platform offers AI-driven suggestions, keyword analysis, and personalized feedback to craft impactful resumes.",
  },
  {
    question: "Are there mock interviews available?",
    answer:
      "Yes! Interview Geeks provides mock interview sessions with AI feedback to improve your responses and confidence.",
  },
  {
    question: "What resources does Interview Geeks offer?",
    answer:
      "We provide curated study materials, coding challenges, and technical resources to enhance your skills.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white py-16 px-8">
      <h2 className="text-4xl font-bold text-center text-green-600 mb-10">
        Frequently Asked Questions
      </h2>
      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-green-50 rounded-xl shadow-md p-4 cursor-pointer"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">
                {faq.question}
              </h3>
              {openIndex === index ? (
                <FaChevronUp className="text-black" />
              ) : (
                <FaChevronDown className="text-black" />
              )}
            </div>
            {openIndex === index && (
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
