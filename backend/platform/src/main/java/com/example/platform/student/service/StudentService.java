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

    public StudentProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ FIX: Find by User ID (More reliable than email)
        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found. Please complete your profile."));

        return mapToDto(profile);
    }

    @Transactional
    public StudentProfileDto updateProfile(StudentProfileDto request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ FIX: Check if profile exists by User ID, otherwise create NEW
        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(StudentProfile.builder()
                        .user(user) // Link the User Relationship
                        .skills("")
                        .savedJobs(new ArrayList<>())
                        .build());

        // Update fields
        if (request.getUniversity() != null) profile.setUniversity(request.getUniversity());
        if (request.getDegree() != null) profile.setDegree(request.getDegree());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getCgpa() != null) profile.setCgpa(request.getCgpa());
        if (request.getExperience() != null) profile.setExperience(request.getExperience());
        if (request.getSkills() != null) profile.setSkills(request.getSkills());
        if (request.getResumeUrl() != null) profile.setResumeUrl(request.getResumeUrl());

        StudentProfile savedProfile = profileRepository.save(profile);
        return mapToDto(savedProfile);
    }

    @Transactional
    public String uploadResume(MultipartFile file, String email) throws IOException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
                
        profile.setResumeFile(file.getBytes());
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

    // Keep Saved Job methods...
    @Transactional
    public String saveJob(Long jobId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
                
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        profile.getSavedJobs().add(job);
        profileRepository.save(profile);
        return "Job Saved";
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getSavedJobs(String email) {
        // Placeholder implementation
        return new ArrayList<>(); 
    }

    @Transactional
    public String unsaveJob(Long jobId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
                
        profile.getSavedJobs().removeIf(job -> job.getId().equals(jobId));
        profileRepository.save(profile);
        return "Job Unsaved";
    }

    // =================================================================
    // MAPPING
    // =================================================================
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
                
                // ✅ MAP RESUME URL BACK TO FRONTEND
                .resumeUrl(profile.getResumeUrl())
                
                .resumeFileName(profile.getResumeFileName())
                .build();
    }
}