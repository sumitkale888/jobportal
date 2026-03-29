import React, { useState, useEffect } from "react";
import { getStudentProfile, updateStudentProfile } from "../api/studentApi";
import { toast } from "react-toastify";
import { User, FileText, Code, BookOpen, Award } from "lucide-react";
import { DashboardShell, PageHeader, SurfaceCard, Input, TextArea, PrimaryButton } from "../components/ui/DashboardUI";

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
    <DashboardShell contentClassName='mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
        <PageHeader badge='Student Profile' icon={User} title='Student Profile' subtitle='Build a high-signal profile that improves matching and recruiter response rates.' />
        <SurfaceCard>

          {loading ? (
            <p className='text-slate-400'>Loading...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="ui-label">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="ui-label">
                    Email
                  </label>
                  <Input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Education Section */}
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" /> Education
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="ui-label">
                    University / College
                  </label>
                  <Input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="MIT, IIT, etc."
                  />
                </div>
                <div>
                  <label className="ui-label">
                    Degree
                  </label>
                  <Input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    placeholder="B.Tech, MBA"
                  />
                </div>
                <div>
                  <label className="ui-label">
                    Graduation Year
                  </label>
                  <Input
                    type="text"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="ui-label">
                    CGPA / Percentage
                  </label>
                  <Input
                    type="number"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    placeholder="9.5"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Skills & Experience */}
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" /> Skills & Experience
              </h3>
              <div className="mb-6">
                <label className="ui-label">
                  <Code className="inline w-4 h-4 mr-1" /> Skills (comma
                  separated)
                </label>
                <TextArea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Java, React, Spring Boot..."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="ui-label">
                  Experience / Projects
                </label>
                <TextArea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Briefly describe your internships or projects..."
                />
              </div>

              {/* ✅ UPDATED: Resume File Upload */}
              <div className="mb-8">
                <label className="ui-label">
                  <FileText className="inline w-4 h-4 mr-1" /> Upload Resume (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="ui-input p-2"
                />
                {/* Show current file name if it exists in DB */}
                {formData.resumeUrl && !file && (
                  <p className="mt-2 text-sm text-emerald-300 font-medium">
                    Current file on record: {formData.resumeUrl}
                  </p>
                )}
              </div>

              <PrimaryButton
                type="submit"
                className='w-full'
              >
                Save Profile
              </PrimaryButton>
            </form>
          )}
        </SurfaceCard>
    </DashboardShell>
  );
};

export default Profile;