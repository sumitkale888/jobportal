package com.example.platform.application.controller;

import com.example.platform.application.service.ApplicationService;
import com.example.platform.common.enums.ApplicationStatus;
import com.example.platform.recruiter.dto.ApplicantDto; // ✅ Import ApplicantDto
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/recruiter/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RecruiterApplicationController {

    private final ApplicationService applicationService;


    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<ApplicantDto>> getJobApplicants(@PathVariable Long jobId, Principal principal) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("📥 GET /job/{jobId} - FETCHING APPLICANTS");
        System.out.println("=".repeat(60));
        System.out.println("Job ID: " + jobId);
        System.out.println("Recruiter email: " + principal.getName());
        
        List<ApplicantDto> applicants = applicationService.getApplicantsForJob(jobId, principal.getName());
        
        System.out.println("✅ Found " + applicants.size() + " applicants:");
        applicants.forEach(app -> {
            System.out.println("  - Application ID: " + app.getApplicationId());
            System.out.println("    Student ID: " + app.getStudentId());
            System.out.println("    Student User ID: " + app.getStudentUserId());
            System.out.println("    Name: " + app.getName());
            System.out.println("    Email: " + app.getEmail());
            System.out.println("    Status: " + app.getStatus());
            System.out.println();
        });
        System.out.println("=".repeat(60) + "\n");
        
        return ResponseEntity.ok(applicants);
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status,
            Principal principal
    ) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(applicationId, status, principal.getName()));
    }

    @PostMapping("/{applicationId}/schedule-interview")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<String> scheduleInterview(
            @PathVariable Long applicationId,
            @RequestBody ScheduleInterviewRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(applicationService.scheduleInterview(applicationId, principal.getName(), request.getInterviewDateTime(), request.getInterviewLocation(), request.getInterviewLink()));
    }

    private static class ScheduleInterviewRequest {
        private LocalDateTime interviewDateTime;
        private String interviewLocation;
        private String interviewLink;

        public LocalDateTime getInterviewDateTime() { return interviewDateTime; }
        public String getInterviewLocation() { return interviewLocation; }
        public String getInterviewLink() { return interviewLink; }
    }
}