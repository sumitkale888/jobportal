import React, { useState, useEffect } from "react";
import { getStudentProfile, updateStudentProfile } from "../api/studentApi";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { User, FileText, Code, BookOpen, Award } from "lucide-react";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null); // ✅ Added state for the PDF file
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skills: "",
    resumeUrl: "", // Now acts as a placeholder for the file name
    university: "",
    degree: "",
    graduationYear: "",
    cgpa: "",
    experience: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getStudentProfile();
      setFormData({
        name: data.name || "",
        email: data.email || "",
        skills: data.skills || "",
        resumeUrl: data.resumeUrl || data.resumeName || "", // Handle old URL or new filename
        university: data.university || "",
        degree: data.degree || "",
        graduationYear: data.graduationYear || "",
        cgpa: data.cgpa || "",
        experience: data.experience || "",
      });
    } catch (error) {
      console.log("No profile found, please create one.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ UPDATED: Send as FormData instead of JSON
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uploadData = new FormData();
      uploadData.append("university", formData.university);
      uploadData.append("degree", formData.degree);
      uploadData.append("cgpa", formData.cgpa);
      uploadData.append("skills", formData.skills);
      uploadData.append("experience", formData.experience);
      
      // If the user selected a new PDF, attach it
      if (file) {
        uploadData.append("resume", file);
      }

      await updateStudentProfile(uploadData);
      toast.success("Profile Updated Successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-8 border-b pb-4">
            <User className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">
              Student Profile
            </h1>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border rounded-lg"
                  />
                </div>
              </div>

              {/* Education Section */}
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" /> Education
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University / College
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="MIT, IIT, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree
                  </label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="B.Tech, MBA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CGPA / Percentage
                  </label>
                  <input
                    type="number"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="9.5"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Skills & Experience */}
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" /> Skills & Experience
              </h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Code className="inline w-4 h-4 mr-1" /> Skills (comma
                  separated)
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Java, React, Spring Boot..."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience / Projects
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Briefly describe your internships or projects..."
                />
              </div>

              {/* ✅ UPDATED: Resume File Upload */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline w-4 h-4 mr-1" /> Upload Resume (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-2 border rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {/* Show current file name if it exists in DB */}
                {formData.resumeUrl && !file && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    Current file on record: {formData.resumeUrl}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Save Profile
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;