package com.example.platform.admin.controller;

import com.example.platform.auth.repository.UserRepository;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.recruiter.model.RecruiterProfile; 
import com.example.platform.recruiter.repository.RecruiterProfileRepository; 
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    // Add this line with your other repositories at the top of AdminController
private final com.example.platform.notification.service.NotificationService notificationService;

    // 1. Existing Dashboard Stats API
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')") 
    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        long totalStudents = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && user.getRole().name().equals("STUDENT"))
                .count();
                
        long totalRecruiters = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && user.getRole().name().equals("RECRUITER"))
                .count();

        long activeJobs = jobRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRecruiters", totalRecruiters); 
        stats.put("totalStudents", totalStudents);
        stats.put("activeJobs", activeJobs);
        
        return ResponseEntity.ok(stats);
    }

    // 2. 🚨 NEW: Fetch all pending (unverified) recruiters
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')") 
    @GetMapping("/pending-recruiters")
    public ResponseEntity<List<RecruiterProfile>> getPendingRecruiters() {
        // Fetch profiles where isVerified is false or null
        List<RecruiterProfile> pendingList = recruiterProfileRepository.findAll().stream()
                .filter(profile -> profile.getIsVerified() == null || !profile.getIsVerified())
                .collect(Collectors.toList());
                
        // 🚨 ADDED THE MISSING RETURN STATEMENT HERE!
        return ResponseEntity.ok(pendingList);
    }

    // 3. 🚨 NEW: Approve a recruiter
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')") 
    @PutMapping("/verify-recruiter/{profileId}")
    public ResponseEntity<Map<String, String>> approveRecruiter(@PathVariable Long profileId) {
        RecruiterProfile profile = recruiterProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
        
        profile.setIsVerified(true);
        recruiterProfileRepository.save(profile);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Recruiter approved successfully!");
        // 🚨 FIRE THE BACKGROUND NOTIFICATION / EMAIL 🚨
    String recruiterEmail = profile.getUser().getEmail(); // Or profile.getUserEmail() depending on your model
    String subject = "🎉 Your JobPortal Account is Approved!";
    String message = "Hello " + profile.getCompanyName() + ",\n\n" +
                  "Great news! Our admin team has verified your company profile. " +
                  "You can now log in and start posting jobs on the platform.\n\n" +
                  "Welcome aboard!";
                  
    notificationService.sendNotification(recruiterEmail, subject, message);
        return ResponseEntity.ok(response);
    }

    // 4. 🚨 NEW: Reject/Delete a recruiter
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')") 
    @DeleteMapping("/reject-recruiter/{profileId}")
    public ResponseEntity<Map<String, String>> rejectRecruiter(@PathVariable Long profileId) {
        RecruiterProfile profile = recruiterProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
        
        // Delete the profile
        recruiterProfileRepository.delete(profile);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Recruiter rejected and removed.");
        return ResponseEntity.ok(response);
    }
}