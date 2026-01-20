package com.example.platform.application.controller;

import com.example.platform.application.dto.ApplicationResponse;
import com.example.platform.application.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/student/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // 1. Apply for a Job (POST /api/student/applications/{jobId})
    @PostMapping("/{jobId}")
    public ResponseEntity<String> applyForJob(@PathVariable Long jobId, Principal principal) {
        return ResponseEntity.ok(applicationService.applyForJob(jobId, principal.getName()));
    }

    // 2. Get My Applications (GET /api/student/applications)
    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(Principal principal) {
        return ResponseEntity.ok(applicationService.getStudentApplications(principal.getName()));
    }
}