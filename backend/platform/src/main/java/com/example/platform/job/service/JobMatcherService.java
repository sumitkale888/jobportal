package com.example.platform.job.service;

import com.example.platform.job.dto.JobMatchDto;
import com.example.platform.job.dto.JobResponse;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.student.model.StudentProfile;
import com.example.platform.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobMatcherService {

    private final JobRepository jobRepository;
    private final StudentProfileRepository studentRepository;
    private final JobService jobService;

    public List<JobMatchDto> getMatchingJobs(String studentEmail) {
        StudentProfile student = studentRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Profile not found. Please add skills first."));

        // ✅ FIX: Logic to handle MULTIPLE SKILLS (Split by comma)
        // We initialize it in one step so Java doesn't complain about "Final Variables"
        final Set<String> studentSkills = (student.getSkills() != null && !student.getSkills().isEmpty()) 
                ? Arrays.stream(student.getSkills().split(",")) // Split "Java, React" -> ["Java", "React"]
                        .map(String::trim)
                        .map(String::toUpperCase)
                        .collect(Collectors.toSet())
                : new HashSet<>();

        if (studentSkills.isEmpty()) {
            return new ArrayList<>(); 
        }

        List<Job> allJobs = jobRepository.findAll();

        return allJobs.stream()
                .map(job -> calculateMatch(job, studentSkills)) 
                .filter(dto -> dto.getMatchPercentage() > 0)
                .sorted(Comparator.comparingInt(JobMatchDto::getMatchPercentage).reversed())
                .collect(Collectors.toList());
    }

    private JobMatchDto calculateMatch(Job job, Set<String> studentSkills) {
        List<String> requiredSkills = job.getRequiredSkills();
        if (requiredSkills == null) requiredSkills = new ArrayList<>();

        if (requiredSkills.isEmpty()) {
            return buildDto(job, 100);
        }

        long matchingCount = requiredSkills.stream()
                .map(String::trim)
                .map(String::toUpperCase)
                .filter(studentSkills::contains)
                .count();

        int percentage = (int) Math.round(((double) matchingCount / requiredSkills.size()) * 100);
        return buildDto(job, percentage);
    }

    private JobMatchDto buildDto(Job job, int percentage) {
        JobResponse jobResponse = jobService.getJobById(job.getId());
        String status = percentage >= 80 ? "Perfect Match! 🔥" : 
                        percentage >= 50 ? "Good Match ✅" : "Low Match ⚠️";

        return JobMatchDto.builder()
                .job(jobResponse)
                .matchPercentage(percentage)
                .matchStatus(status)
                .build();
    }
}