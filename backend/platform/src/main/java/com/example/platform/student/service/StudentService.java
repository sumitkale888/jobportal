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

    private final StudentProfileRepository profileRepository; // Variable name used throughout
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

    // ✅ FIXED: Handles multipart file directly
    @Transactional
    public StudentProfile createOrUpdateProfile(String email, String university, String degree, Double cgpa, String skills, String experience, MultipartFile resumeFile) throws Exception {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile profile = profileRepository.findByUserId(user.getId()).orElse(new StudentProfile());

        profile.setUser(user);
        profile.setUniversity(university);
        profile.setDegree(degree);
        profile.setCgpa(cgpa);
        profile.setSkills(skills);
        profile.setExperience(experience);

        // Handle File Upload securely
        if (resumeFile != null && !resumeFile.isEmpty()) {
            profile.setResumeData(resumeFile.getBytes());
            profile.setResumeContentType(resumeFile.getContentType());
            profile.setResumeFileName(resumeFile.getOriginalFilename());
        }

        return profileRepository.save(profile);
    }

    // ✅ GET RESUME METHOD
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
        return StudentProfileDto.builder()
                .name(profile.getUser().getName())
                .email(profile.getUser().getEmail())
                .university(profile.getUniversity())
                .degree(profile.getDegree())
                .graduationYear(profile.getGraduationYear())
                .cgpa(profile.getCgpa())
                .skills(profile.getSkills())
                .experience(profile.getExperience())
                // Pass filename instead of URL so frontend knows a file exists
                .resumeUrl(profile.getResumeFileName()) 
                .resumeFileName(profile.getResumeFileName())
                .build();
    }
}