package com.example.platform.job.service;

import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.job.dto.JobMatchDto;
import com.example.platform.job.dto.JobResponse;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.student.model.StudentProfile;
import com.example.platform.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobMatcherService {

    private final JobRepository jobRepository;
    private final StudentProfileRepository studentRepository;
    private final UserRepository userRepository; // ✅ Added to find User ID first
    private final JobService jobService;

    @Transactional(readOnly = true)
    public List<JobMatchDto> getMatchingJobs(String studentEmail) {
        // 1. Get User First (to get the ID)
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Get Profile using User ID (Reliable fix)
        StudentProfile student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found. Please add skills first."));

        // 3. Logic to handle MULTIPLE SKILLS (Split string by comma)
        final Set<String> studentSkills = (student.getSkills() != null && !student.getSkills().isEmpty()) 
                ? Arrays.stream(student.getSkills().split(",")) 
                        .map(String::trim)
                        .map(String::toUpperCase)
                        .collect(Collectors.toSet())
                : new HashSet<>();

        // If student has no skills, return empty list
        if (studentSkills.isEmpty()) {
            return new ArrayList<>(); 
        }

        // 4. Compare against all jobs
        List<Job> allJobs = jobRepository.findAll();

        return allJobs.stream()
                .map(job -> calculateMatch(job, studentSkills)) 
                .filter(dto -> dto.getMatchPercentage() > 0) // Only show if there is at least some match
                .sorted(Comparator.comparingInt(JobMatchDto::getMatchPercentage).reversed()) // Highest match first
                .collect(Collectors.toList());
    }

    private JobMatchDto calculateMatch(Job job, Set<String> studentSkills) {
        List<String> requiredSkills = job.getRequiredSkills();
        
        // Handle null safety for job skills
        if (requiredSkills == null) requiredSkills = new ArrayList<>();

        // If job requires no skills, it's an automatic 100% match for everyone
        if (requiredSkills.isEmpty()) {
            return buildDto(job, 100);
        }

        // Count how many required skills the student actually has
        long matchingCount = requiredSkills.stream()
                .map(String::trim)
                .map(String::toUpperCase)
                .filter(studentSkills::contains)
                .count();

        // Calculate percentage (Matches / Total Required) * 100
        int percentage = (int) Math.round(((double) matchingCount / requiredSkills.size()) * 100);
        
        return buildDto(job, percentage);
    }

    private JobMatchDto buildDto(Job job, int percentage) {
        // Reuse JobService to get a clean JobResponse DTO
        JobResponse jobResponse = jobService.getJobById(job.getId());
        
        // Determine the text status based on score
        String status = percentage >= 80 ? "Perfect Match! 🔥" : 
                        percentage >= 50 ? "Good Match ✅" : "Low Match ⚠️";

        return JobMatchDto.builder()
                .job(jobResponse)
                .matchPercentage(percentage)
                .matchStatus(status)
                .build();
    }
}