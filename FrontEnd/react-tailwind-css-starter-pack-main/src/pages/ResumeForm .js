import React, { useState } from "react";

const ResumeForm = () => {
  const [formData, setFormData] = useState({
    userId: "", // You might get this from authentication context or localStorage
    name: "",
    email: "",
    phone: "",
    portfolio: "",
    github: "",
    linkedin: "",
    codingProfiles: [{ platform: "", link: "" }],
    education: [
      {
        institution: "",
        degree: "",
        duration: "",
        gpaLabel: "GPA",
        gpa: "",
        scale: "4.0",
      },
    ],
    additionalActivities: [{ title: "", period: "", description: "" }],
    skills: {
      programmingLanguages: [],
      softwareDevelopment: [],
      webTechnologies: [],
      databasesAndTools: [],
    },
    projects: [
      {
        title: "",
        technologies: "",
        description: [""],
        link: "",
      },
    ],
    experience: [
      {
        title: "",
        company: "",
        period: "",
        description: "",
      },
    ],
    achievements: [""],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle nested object changes
  const handleNestedChange = (e, section, index, field) => {
    const updatedSection = [...formData[section]];
    updatedSection[index][field] = e.target.value;
    setFormData({ ...formData, [section]: updatedSection });
  };

  // Handle skills (array items)
  const handleSkillsChange = (e, skillType) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setFormData({
      ...formData,
      skills: {
        ...formData.skills,
        [skillType]: skills,
      },
    });
  };

  // Add more fields
  const addField = (section) => {
    if (section === "codingProfiles") {
      setFormData({
        ...formData,
        codingProfiles: [
          ...formData.codingProfiles,
          { platform: "", link: "" },
        ],
      });
    } else if (section === "education") {
      setFormData({
        ...formData,
        education: [
          ...formData.education,
          {
            institution: "",
            degree: "",
            duration: "",
            gpaLabel: "GPA",
            gpa: "",
            scale: "4.0",
          },
        ],
      });
    } else if (section === "projects") {
      setFormData({
        ...formData,
        projects: [
          ...formData.projects,
          { title: "", technologies: "", description: [""], link: "" },
        ],
      });
    } else if (section === "experience") {
      setFormData({
        ...formData,
        experience: [
          ...formData.experience,
          { title: "", company: "", period: "", description: "" },
        ],
      });
    } else if (section === "achievements") {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, ""],
      });
    } else if (section === "additionalActivities") {
      setFormData({
        ...formData,
        additionalActivities: [
          ...formData.additionalActivities,
          { title: "", period: "", description: "" },
        ],
      });
    }
  };

  // Remove field
  const removeField = (section, index) => {
    const updatedSection = [...formData[section]];
    updatedSection.splice(index, 1);
    setFormData({ ...formData, [section]: updatedSection });
  };

  // Add project description point
  const addProjectDescription = (projectIndex) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[projectIndex].description.push("");
    setFormData({ ...formData, projects: updatedProjects });
  };

  // Update project description
  const handleProjectDescriptionChange = (e, projectIndex, descIndex) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[projectIndex].description[descIndex] = e.target.value;
    setFormData({ ...formData, projects: updatedProjects });
  };

  // Handle achievement change
  const handleAchievementChange = (e, index) => {
    const updatedAchievements = [...formData.achievements];
    updatedAchievements[index] = e.target.value;
    setFormData({ ...formData, achievements: updatedAchievements });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill in all required personal information");
      return;
    }

    if (formData.education.length === 0 || !formData.education[0].institution) {
      setError("Please add at least one education entry");
      return;
    }

    if (formData.skills.programmingLanguages.length === 0) {
      setError("Please add at least one programming language");
      return;
    }

    if (formData.projects.length === 0 || !formData.projects[0].title) {
      setError("Please add at least one project");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get userId from localStorage or context
      const userId = localStorage.getItem("userId") || "";
      const dataToSend = { ...formData, userId };
      console.log(userId);
      console.log(dataToSend);

      // Send data to your specified API endpoint
      const response = await fetch(
        "http://localhost:4000/api/v1/resumeBuilder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate resume");
      }

      // Handle successful response - should be a PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error building resume:", err);
      setError(err.message || "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Build Your Resume</h2>
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border-l-4 border-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Phone*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Portfolio Website
              </label>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">GitHub Profile</label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">LinkedIn Profile</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Coding Profiles */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Coding Profiles</h3>
          {formData.codingProfiles.map((profile, index) => (
            <div
              key={`coding-${index}`}
              className="p-4 mb-4 border border-dashed border-gray-300 rounded-md bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Platform</label>
                  <input
                    type="text"
                    value={profile.platform}
                    onChange={(e) =>
                      handleNestedChange(e, "codingProfiles", index, "platform")
                    }
                    placeholder="LeetCode, CodeChef, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Profile Link</label>
                  <input
                    type="url"
                    value={profile.link}
                    onChange={(e) =>
                      handleNestedChange(e, "codingProfiles", index, "link")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {index > 0 && (
                <button
                  type="button"
                  className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => removeField("codingProfiles", index)}
                >
                  Remove Profile
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={() => addField("codingProfiles")}
          >
            Add Coding Profile
          </button>
        </div>

        {/* Education */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Education*</h3>
          {formData.education.map((edu, index) => (
            <div
              key={`edu-${index}`}
              className="p-4 mb-4 border border-dashed border-gray-300 rounded-md bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Institution*</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) =>
                      handleNestedChange(e, "education", index, "institution")
                    }
                    required={index === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Degree*</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) =>
                      handleNestedChange(e, "education", index, "degree")
                    }
                    required={index === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Duration*</label>
                  <input
                    type="text"
                    value={edu.duration}
                    onChange={(e) =>
                      handleNestedChange(e, "education", index, "duration")
                    }
                    placeholder="2020 - 2024"
                    required={index === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium mb-1">GPA Label</label>
                    <input
                      type="text"
                      value={edu.gpaLabel}
                      onChange={(e) =>
                        handleNestedChange(e, "education", index, "gpaLabel")
                      }
                      placeholder="GPA, CGPA, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">GPA</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) =>
                        handleNestedChange(e, "education", index, "gpa")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Scale</label>
                    <input
                      type="text"
                      value={edu.scale}
                      onChange={(e) =>
                        handleNestedChange(e, "education", index, "scale")
                      }
                      placeholder="4.0, 10, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              {index > 0 && (
                <button
                  type="button"
                  className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => removeField("education", index)}
                >
                  Remove Education
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={() => addField("education")}
          >
            Add Education
          </button>
        </div>

        {/* Skills */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Skills*</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">
                Programming Languages*
              </label>
              <textarea
                value={formData.skills.programmingLanguages.join(", ")}
                onChange={(e) => handleSkillsChange(e, "programmingLanguages")}
                placeholder="Python, JavaScript, Java, etc. (comma-separated)"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Software Development
              </label>
              <textarea
                value={formData.skills.softwareDevelopment.join(", ")}
                onChange={(e) => handleSkillsChange(e, "softwareDevelopment")}
                placeholder="Agile, TDD, CI/CD, etc. (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Web Technologies</label>
              <textarea
                value={formData.skills.webTechnologies.join(", ")}
                onChange={(e) => handleSkillsChange(e, "webTechnologies")}
                placeholder="React, Node.js, Express, etc. (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Databases and Tools
              </label>
              <textarea
                value={formData.skills.databasesAndTools.join(", ")}
                onChange={(e) => handleSkillsChange(e, "databasesAndTools")}
                placeholder="MongoDB, MySQL, Docker, etc. (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Projects*</h3>
          {formData.projects.map((project, projectIndex) => (
            <div
              key={`project-${projectIndex}`}
              className="p-4 mb-4 border border-dashed border-gray-300 rounded-md bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-1">
                    Project Title*
                  </label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) =>
                      handleNestedChange(e, "projects", projectIndex, "title")
                    }
                    required={projectIndex === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Technologies Used
                  </label>
                  <input
                    type="text"
                    value={project.technologies}
                    onChange={(e) =>
                      handleNestedChange(
                        e,
                        "projects",
                        projectIndex,
                        "technologies"
                      )
                    }
                    placeholder="React, Node.js, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Project Link</label>
                <input
                  type="url"
                  value={project.link}
                  onChange={(e) =>
                    handleNestedChange(e, "projects", projectIndex, "link")
                  }
                  placeholder="GitHub repository or deployed link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">
                  Description Points*
                </label>
                {project.description.map((desc, descIndex) => (
                  <div
                    key={`desc-${projectIndex}-${descIndex}`}
                    className="flex items-center mb-2"
                  >
                    <textarea
                      value={desc}
                      onChange={(e) =>
                        handleProjectDescriptionChange(
                          e,
                          projectIndex,
                          descIndex
                        )
                      }
                      placeholder="Describe the project, features, or your role"
                      required={projectIndex === 0 && descIndex === 0}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    />
                    {descIndex > 0 && (
                      <button
                        type="button"
                        className="ml-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md"
                        onClick={() => {
                          const updatedProjects = [...formData.projects];
                          updatedProjects[projectIndex].description.splice(
                            descIndex,
                            1
                          );
                          setFormData({
                            ...formData,
                            projects: updatedProjects,
                          });
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  onClick={() => addProjectDescription(projectIndex)}
                >
                  Add Description Point
                </button>
              </div>
              {projectIndex > 0 && (
                <button
                  type="button"
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => removeField("projects", projectIndex)}
                >
                  Remove Project
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={() => addField("projects")}
          >
            Add Project
          </button>
        </div>

        {/* Experience */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Experience</h3>
          {formData.experience.map((exp, index) => (
            <div
              key={`exp-${index}`}
              className="p-4 mb-4 border border-dashed border-gray-300 rounded-md bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) =>
                      handleNestedChange(e, "experience", index, "title")
                    }
                    placeholder="Software Engineer, Intern, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) =>
                      handleNestedChange(e, "experience", index, "company")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Period</label>
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) =>
                      handleNestedChange(e, "experience", index, "period")
                    }
                    placeholder="Jun 2023 - Present"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) =>
                    handleNestedChange(e, "experience", index, "description")
                  }
                  placeholder="Describe your responsibilities and achievements"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => removeField("experience", index)}
                >
                  Remove Experience
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={() => addField("experience")}
          >
            Add Experience
          </button>
        </div>

        {/* Additional Activities */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Additional Activities</h3>
          {formData.additionalActivities.map((activity, index) => (
            <div
              key={`activity-${index}`}
              className="p-4 mb-4 border border-dashed border-gray-300 rounded-md bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={activity.title}
                    onChange={(e) =>
                      handleNestedChange(
                        e,
                        "additionalActivities",
                        index,
                        "title"
                      )
                    }
                    placeholder="Club Member, Open Source Contributor, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Period</label>
                  <input
                    type="text"
                    value={activity.period}
                    onChange={(e) =>
                      handleNestedChange(
                        e,
                        "additionalActivities",
                        index,
                        "period"
                      )
                    }
                    placeholder="2022 - Present"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  value={activity.description}
                  onChange={(e) =>
                    handleNestedChange(
                      e,
                      "additionalActivities",
                      index,
                      "description"
                    )
                  }
                  placeholder="Describe your role and contributions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => removeField("additionalActivities", index)}
                >
                  Remove Activity
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={() => addField("additionalActivities")}
          >
            Add Activity
          </button>
        </div>

        {/* Achievements */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Achievements</h3>
          {formData.achievements.map((achievement, index) => (
            <div
              key={`achievement-${index}`}
              className="flex items-center mb-3"
            >
              <input
                type="text"
                value={achievement}
                onChange={(e) => handleAchievementChange(e, index)}
                placeholder="Academic, professional, or personal achievement"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {index > 0 && (
                <button
                  type="button"
                  className="ml-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                  onClick={() => removeField("achievements", index)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={() => addField("achievements")}
          >
            Add Achievement
          </button>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-md text-white font-medium ${
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
                Generating Resume...
              </span>
            ) : (
              "Generate Resume"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default ResumeForm;
