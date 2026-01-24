package com.example.platform.application.controller;

import com.example.platform.application.dto.ApplicationResponse;
import com.example.platform.application.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // Includes @CrossOrigin

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/student/applications")
@RequiredArgsConstructor
// ✅ ADD THIS LINE TO FIX CONNECTION ERRORS
@CrossOrigin(origins = "http://localhost:5173") 
public class ApplicationController {

    private final ApplicationService applicationService;

    // 1. Apply for a Job
    @PostMapping("/{jobId}")
    public ResponseEntity<?> applyForJob(@PathVariable Long jobId, Principal principal) {
        try {
            return ResponseEntity.ok(applicationService.applyForJob(jobId, principal.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Get My Applications
    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(Principal principal) {
        return ResponseEntity.ok(applicationService.getStudentApplications(principal.getName()));
    }
}