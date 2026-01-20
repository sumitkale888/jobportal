package com.example.platform.student.controller;

import com.example.platform.student.dto.StudentProfileDto;
import com.example.platform.student.model.StudentProfile;
import com.example.platform.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

import java.io.IOException;
import java.security.Principal;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentService studentService;

    // Get My Profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileDto> getProfile(Principal principal) {
        return ResponseEntity.ok(studentService.getProfile(principal.getName()));
    }

    // Create or Update Profile
    @PostMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileDto> updateProfile(@RequestBody StudentProfileDto dto, Principal principal) {
        return ResponseEntity.ok(studentService.updateProfile(dto, principal.getName()));
    }

    // Upload Resume
    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> uploadResume(@RequestParam("file") MultipartFile file, Principal principal) {
        try {
            return ResponseEntity.ok(studentService.uploadResume(file, principal.getName()));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error uploading file");
        }
    }

    // Download Resume
    @GetMapping("/resume")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER')")
    public ResponseEntity<byte[]> downloadResume(Principal principal) {
        StudentProfile profile = studentService.getProfileEntity(principal.getName());
        
        if (profile.getResumeFile() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + profile.getResumeFileName() + "\"")
                .contentType(MediaType.parseMediaType(profile.getResumeContentType()))
                .body(profile.getResumeFile());
    }

    // ... (Existing endpoints) ...
    
    // NEW: Save a Job
    @PostMapping("/saved-jobs/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> saveJob(@PathVariable Long jobId, Principal principal) {
        return ResponseEntity.ok(studentService.saveJob(jobId, principal.getName()));
    }

    // NEW: Get All Saved Jobs
    @GetMapping("/saved-jobs")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<com.example.platform.job.dto.JobResponse>> getSavedJobs(Principal principal) {
        return ResponseEntity.ok(studentService.getSavedJobs(principal.getName()));
    }
    
    // NEW: Unsave a Job
    @DeleteMapping("/saved-jobs/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> unsaveJob(@PathVariable Long jobId, Principal principal) {
        return ResponseEntity.ok(studentService.unsaveJob(jobId, principal.getName()));
    }
}
