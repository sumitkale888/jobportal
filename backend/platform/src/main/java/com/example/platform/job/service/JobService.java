package com.example.platform.job.service;

import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.job.dto.JobRequest;
import com.example.platform.job.dto.JobResponse;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @Transactional
    public JobResponse postJob(JobRequest request, String email) {
        User recruiter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .companyName(request.getCompanyName())
                .location(request.getLocation())
                .salary(request.getSalary())
                .jobType(request.getJobType())
                .requiredSkills(request.getRequiredSkills())
                .postedBy(recruiter)
                .build();

        return mapToResponse(jobRepository.save(job));
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getJobsByRecruiter(String email) {
        // ✅ Safe Fetch
        return jobRepository.findByPostedByEmailOrderByPostedAtDesc(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return mapToResponse(job);
    }

    @Transactional
    public void deleteJob(Long jobId, String email) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (job.getPostedBy() != null && !job.getPostedBy().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        jobRepository.delete(job);
    }

    @Transactional
    public JobResponse updateJob(Long jobId, JobRequest request, String email) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (job.getPostedBy() != null && !job.getPostedBy().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());
        job.setJobType(request.getJobType());
        job.setRequiredSkills(request.getRequiredSkills());
        return mapToResponse(jobRepository.save(job));
    }

    // ✅ SAFE MAPPER: Handles nulls explicitly to stop 500 errors
    private JobResponse mapToResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .companyName(job.getCompanyName())
                .location(job.getLocation())
                .salary(job.getSalary())
                .jobType(job.getJobType()) 
                .requiredSkills(job.getRequiredSkills() != null ? job.getRequiredSkills() : new ArrayList<>())
                .postedAt(job.getPostedAt())
                .postedByEmail(job.getPostedBy() != null ? job.getPostedBy().getEmail() : "Unknown")
                .recruiterName(job.getPostedBy() != null ? job.getPostedBy().getName() : "Unknown")
                .build();
    }
}