package com.example.platform.student.service;

import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.job.dto.JobResponse;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.student.dto.StudentProfileDto;
import com.example.platform.student.model.StudentProfile;
import com.example.platform.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    @Transactional(readOnly = true)
    public StudentProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found. Please complete your profile."));

        return mapToDto(profile);
    }

    @Transactional
    public StudentProfile createOrUpdateProfile(
            String email,
            String phone,
            String location,
            String headline,
            String about,
            String university,
            String degree,
            String graduationYear,
            Double cgpa,
            String specialization,
            String currentSemester,
            String courseType,
            String skills,
            String experience,
            String projects,
            String certifications,
            String achievements,
            String preferredRoles,
            String languages,
            String links,
            MultipartFile resumeFile
    ) throws Exception {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile profile = profileRepository.findByUserId(user.getId()).orElse(new StudentProfile());

        profile.setUser(user);
        profile.setPhone(phone);
        profile.setLocation(location);
        profile.setHeadline(headline);
        profile.setAbout(about);
        profile.setUniversity(university);
        profile.setDegree(degree);
        profile.setGraduationYear(graduationYear);
        profile.setCgpa(cgpa);
        profile.setSpecialization(specialization);
        profile.setCurrentSemester(currentSemester);
        profile.setCourseType(courseType);
        profile.setSkills(skills);
        profile.setExperience(experience);
        profile.setProjects(projects);
        profile.setCertifications(certifications);
        profile.setAchievements(achievements);
        profile.setPreferredRoles(preferredRoles);
        profile.setLanguages(languages);
        profile.setLinks(links);

        if (resumeFile != null && !resumeFile.isEmpty()) {
            profile.setResumeData(resumeFile.getBytes());
            profile.setResumeContentType(resumeFile.getContentType());
            profile.setResumeFileName(resumeFile.getOriginalFilename());
        }

        return profileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public StudentProfile getResumeByStudentId(Long studentId) {
        return profileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    @Transactional
    public String uploadResume(MultipartFile file, String email) throws IOException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
                
        profile.setResumeData(file.getBytes());
        profile.setResumeFileName(file.getOriginalFilename());
        profile.setResumeContentType(file.getContentType());
        profileRepository.save(profile);
        return "File uploaded";
    }

    @Transactional(readOnly = true)
    public StudentProfile getProfileEntity(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    @Transactional
    public String saveJob(Long jobId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile profile = profileRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Profile not found"));
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        
        profile.getSavedJobs().add(job);
        profileRepository.save(profile);
        return "Job Saved";
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getSavedJobs(String email) {
        return new ArrayList<>(); 
    }

    @Transactional
    public String unsaveJob(Long jobId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile profile = profileRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Profile not found"));
                
        profile.getSavedJobs().removeIf(job -> job.getId().equals(jobId));
        profileRepository.save(profile);
        return "Job Unsaved";
    }

    private StudentProfileDto mapToDto(StudentProfile profile) {
        List<String> missingSections = calculateMissingSections(profile);
        final int totalSections = 12;
        int profileCompletionPercentage = Math.round(((totalSections - missingSections.size()) / (float) totalSections) * 100);

        return StudentProfileDto.builder()
                .id(profile.getId())
                .name(profile.getUser().getName())
                .email(profile.getUser().getEmail())
            .phone(profile.getPhone())
            .location(profile.getLocation())
            .headline(profile.getHeadline())
            .about(profile.getAbout())
                .university(profile.getUniversity())
                .degree(profile.getDegree())
                .graduationYear(profile.getGraduationYear())
                .cgpa(profile.getCgpa())
            .specialization(profile.getSpecialization())
            .currentSemester(profile.getCurrentSemester())
            .courseType(profile.getCourseType())
                .skills(profile.getSkills())
                .experience(profile.getExperience())
            .projects(profile.getProjects())
            .certifications(profile.getCertifications())
            .achievements(profile.getAchievements())
            .preferredRoles(profile.getPreferredRoles())
            .languages(profile.getLanguages())
            .links(profile.getLinks())
                .resumeUrl(profile.getResumeFileName()) 
                .resumeFileName(profile.getResumeFileName())
                .profileCompletionPercentage(profileCompletionPercentage)
                .missingProfileSections(missingSections)
                .build();
    }

    private List<String> calculateMissingSections(StudentProfile profile) {
        List<String> missingSections = new ArrayList<>();

        if (isBlank(profile.getPhone())) {
            missingSections.add("Phone");
        }
        if (isBlank(profile.getLocation())) {
            missingSections.add("Location");
        }
        if (isBlank(profile.getHeadline())) {
            missingSections.add("Headline");
        }
        if (isBlank(profile.getAbout())) {
            missingSections.add("About");
        }
        if (isBlank(profile.getUniversity())) {
            missingSections.add("University");
        }
        if (isBlank(profile.getDegree())) {
            missingSections.add("Degree");
        }
        if (isBlank(profile.getGraduationYear())) {
            missingSections.add("Graduation Year");
        }
        if (isBlank(profile.getProjects())) {
            missingSections.add("Projects");
        }
        if (isBlank(profile.getPreferredRoles())) {
            missingSections.add("Preferred Roles");
        }
        if (isBlank(profile.getSkills())) {
            missingSections.add("Skills");
        }
        if (isBlank(profile.getExperience())) {
            missingSections.add("Experience");
        }
        if (profile.getResumeData() == null || profile.getResumeData().length == 0) {
            missingSections.add("Resume");
        }

        return missingSections;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}