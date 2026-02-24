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

import java.io.IOException;
import java.security.Principal;
import java.util.List;

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

    // ... inside StudentController ...

    // ✅ FIXED: Added "/profile" to the mapping
    @PostMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> updateProfile(
            @RequestParam(value = "university", required = false) String university,
            @RequestParam(value = "degree", required = false) String degree,
            @RequestParam(value = "cgpa", required = false) Double cgpa,
            @RequestParam(value = "skills", required = false) String skills,
            @RequestParam(value = "experience", required = false) String experience,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            Principal principal) {
        try {
            studentService.createOrUpdateProfile(principal.getName(), university, degree, cgpa, skills, experience, resume);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error uploading file");
        }
    }

    // Upload Resume (Independent Endpoint)
    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> uploadResume(@RequestParam("file") MultipartFile file, Principal principal) {
        try {
            return ResponseEntity.ok(studentService.uploadResume(file, principal.getName()));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error uploading file");
        }
    }

    // ✅ FIXED: PDF Download Endpoint
    @GetMapping("/resume/{studentId}")
    public ResponseEntity<byte[]> getResume(@PathVariable Long studentId) {
        StudentProfile profile = studentService.getResumeByStudentId(studentId);

        if (profile.getResumeData() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + profile.getResumeFileName() + "\"")
                .contentType(MediaType.parseMediaType(profile.getResumeContentType()))
                .body(profile.getResumeData());
    }
    
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
    
    @DeleteMapping("/saved-jobs/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> unsaveJob(@PathVariable Long jobId, Principal principal) {
        return ResponseEntity.ok(studentService.unsaveJob(jobId, principal.getName()));
    }
}