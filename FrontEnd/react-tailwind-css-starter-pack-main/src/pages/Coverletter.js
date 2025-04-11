import React, { useState } from "react";
import axios from "axios";

const CoverLetterForm = () => {
  const [formData, setFormData] = useState({
    userId: "", // Will be set from auth context or localStorage
    name: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    jobTitle: "",
    company: "",
    companyAddress: "",
    companyCity: "",
    companyPostalCode: "",
    date: "",
    attachments: "",
    content: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get userId from auth context or localStorage
      const userId = localStorage.getItem("userId") || "test-user-id";

      // Process the content field to handle literal '\n' strings
      const processedContent = formData.content.replace(/\\n/g, "\n");

      const dataToSend = {
        ...formData,
        userId,
        content: processedContent, // Use the processed content
      };

      const response = await axios.post(
        "http://localhost:4000/api/v1/coverLetterBuilder",
        dataToSend,
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "cover_letter.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess(true);
    } catch (err) {
      console.error("Error generating cover letter:", err);
      setError(err.response?.data?.error || "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        Cover Letter Generator
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Cover letter generated successfully!
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md"
      >
        {/* Personal Information Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Your Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Phone*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Company Information Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Job Title*</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Company Name*</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Company Address
              </label>
              <input
                type="text"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Company City</label>
              <input
                type="text"
                name="companyCity"
                value={formData.companyCity}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Company Postal Code
              </label>
              <input
                type="text"
                name="companyPostalCode"
                value={formData.companyPostalCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Date (leave blank for today)
              </label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
                placeholder="e.g. June 15, 2023"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Cover Letter Content */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Cover Letter Content
          </h2>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Attachments (optional)
            </label>
            <input
              type="text"
              name="attachments"
              value={formData.attachments}
              onChange={handleChange}
              placeholder="e.g. Resume, Portfolio"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Letter Content*</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={10}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your cover letter content here..."
            ></textarea>
            <p className="text-sm text-gray-500 mt-2">
              Tip: Use \n for new lines and bullet points
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-white font-medium ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
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
                Generating...
              </span>
            ) : (
              "Generate Cover Letter"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CoverLetterForm;
