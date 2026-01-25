package com.example.platform.job.controller;

import com.example.platform.job.dto.JobRequest;
import com.example.platform.job.dto.JobResponse;
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
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    private final JobService jobService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobResponse> postJob(@RequestBody JobRequest request, Principal principal) {
        return ResponseEntity.ok(jobService.postJob(request, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<JobResponse>> getMyJobs(Principal principal) {
        return ResponseEntity.ok(jobService.getJobsByRecruiter(principal.getName()));
    }

    // ✅ FEATURE: Delete Job
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<String> deleteJob(@PathVariable Long id, Principal principal) {
        jobService.deleteJob(id, principal.getName());
        return ResponseEntity.ok("Job deleted successfully");
    }

    // ✅ FEATURE: Update Job
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobResponse> updateJob(@PathVariable Long id, @RequestBody JobRequest request, Principal principal) {
        return ResponseEntity.ok(jobService.updateJob(id, request, principal.getName()));
    }
    // ✅ SEARCH ENDPOINT
    @GetMapping("/search")
    public ResponseEntity<List<JobResponse>> searchJobs(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(jobService.searchJobs(keyword));
    }
}