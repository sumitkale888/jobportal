package com.example.platform.job.controller;

import com.example.platform.job.dto.JobMatchDto;
import com.example.platform.job.dto.JobPostRequest;
import com.example.platform.job.dto.JobResponse;
import com.example.platform.job.service.JobMatcherService;
import com.example.platform.job.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final JobMatcherService jobMatcherService; // ✅ Declared ONLY ONCE

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobResponse> postJob(@RequestBody JobPostRequest request, Principal principal) {
        return ResponseEntity.ok(jobService.postJob(request, principal.getName()));
    }

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<JobResponse>> getMyJobs(Principal principal) {
        return ResponseEntity.ok(jobService.getJobsByRecruiter(principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/match")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<JobMatchDto>> getMatchingJobs(Principal principal) {
        return ResponseEntity.ok(jobMatcherService.getMatchingJobs(principal.getName()));
    }
}