package com.example.platform.job.service;



import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.job.dto.JobPostRequest;
import com.example.platform.job.dto.JobResponse;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    // 1. Post a new Job (Recruiter Only)
    public JobResponse postJob(JobPostRequest request, String email) {
        User recruiter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .companyName(request.getCompanyName())
                .location(request.getLocation())
                .jobType(request.getJobType())
                .salary(request.getSalary())
                .requiredSkills(request.getRequiredSkills())
                .postedBy(recruiter)
                .build();

        Job savedJob = jobRepository.save(job);
        return mapToResponse(savedJob);
    }

    // 2. Get All Jobs (For Students)
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 3. Get Jobs by Recruiter (For Recruiter Dashboard)
    public List<JobResponse> getJobsByRecruiter(String email) {
        User recruiter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return jobRepository.findByPostedById(recruiter.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    // 4. Get Single Job Details
    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return mapToResponse(job);
    }

    // Helper method to convert Entity to DTO
    private JobResponse mapToResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .companyName(job.getCompanyName())
                .location(job.getLocation())
                .jobType(job.getJobType())
                .salary(job.getSalary())
                .requiredSkills(job.getRequiredSkills())
                .postedAt(job.getPostedAt())
                .recruiterName(job.getPostedBy().getName())
                .build();
    }
}
