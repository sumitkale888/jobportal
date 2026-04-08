package com.example.platform.admin.controller;

import org.springframework.transaction.annotation.Transactional;

import com.example.platform.admin.dto.SystemStatsDto;
import com.example.platform.application.model.Application;
import com.example.platform.application.repository.ApplicationRepository;
import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.common.enums.JobStatus;
import com.example.platform.common.enums.Role;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.recruiter.model.RecruiterProfile;
import com.example.platform.recruiter.repository.RecruiterProfileRepository;
import com.example.platform.notification.service.NotificationService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    private final List<String> allowedCategories = new CopyOnWriteArrayList<>(List.of("IT", "Marketing", "Finance", "HR", "Sales"));
    private final Map<String, Boolean> featureToggles = new ConcurrentHashMap<>(Map.of(
            "jobPosting", true,
            "userRegistration", true,
            "maintenanceMode", false
    ));

    // Dashboard + Analytics
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @GetMapping("/dashboard-stats")
    public ResponseEntity<SystemStatsDto> getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalRecruiters = userRepository.countByRole(Role.RECRUITER);
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long activeCompanies = recruiterProfileRepository.count();

        SystemStatsDto stats = SystemStatsDto.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalRecruiters(totalRecruiters)
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .activeCompanies(activeCompanies)
                .build();

        return ResponseEntity.ok(stats);
    }

    // User Management
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(@RequestParam(required = false) String role) {
        List<User> users = userRepository.findAll();
        if (role != null && !role.isBlank()) {
            return ResponseEntity.ok(users.stream()
                    .filter(u -> u.getRole() != null && u.getRole().name().equalsIgnoreCase(role))
                    .collect(Collectors.toList()));
        }
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(@PathVariable Long userId, @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(request.getRole());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User role updated"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<Map<String, String>> banUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User banned"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<Map<String, String>> unbanUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User unbanned"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId, Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        if (currentUser.getId().equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete your own account"));
        }
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    // Recruiter / Company Verification
        @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
        @GetMapping("/recruiters")
        public ResponseEntity<List<RecruiterProfileDto>> getRecruiterProfiles(
            @RequestParam(required = false) Boolean verified
        ) {
        List<RecruiterProfileDto> recruiters = recruiterProfileRepository.findAll().stream()
            .filter(p -> verified == null || Objects.equals(Boolean.TRUE.equals(p.getIsVerified()), verified))
            .map(this::mapRecruiterProfile)
            .collect(Collectors.toList());
        return ResponseEntity.ok(recruiters);
        }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @GetMapping("/pending-recruiters")
    public ResponseEntity<List<RecruiterProfile>> getPendingRecruiters() {
        List<RecruiterProfile> pending = recruiterProfileRepository.findAll().stream()
                .filter(p -> p.getIsVerified() == null || !p.getIsVerified())
                .collect(Collectors.toList());
        return ResponseEntity.ok(pending);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/verify-recruiter/{profileId}")
    public ResponseEntity<Map<String, String>> approveRecruiter(@PathVariable Long profileId) {
        RecruiterProfile profile = recruiterProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
        profile.setIsVerified(true);
        recruiterProfileRepository.save(profile);
        String email = profile.getUser().getEmail();
        notificationService.sendNotification(email, "Recruiter account verified", "Your company has been verified and is approved to post jobs.");
        return ResponseEntity.ok(Map.of("message", "Recruiter approved"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @DeleteMapping("/reject-recruiter/{profileId}")
    public ResponseEntity<Map<String, String>> rejectRecruiter(@PathVariable Long profileId) {
        recruiterProfileRepository.deleteById(profileId);
        return ResponseEntity.ok(Map.of("message", "Recruiter rejected and removed"));
    }

    private RecruiterProfileDto mapRecruiterProfile(RecruiterProfile profile) {
        return RecruiterProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .recruiterName(profile.getUser() != null ? profile.getUser().getName() : null)
                .recruiterEmail(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .companyName(profile.getCompanyName())
                .websiteUrl(profile.getWebsiteUrl())
                .companyDescription(profile.getCompanyDescription())
                .headOfficeLocation(profile.getHeadOfficeLocation())
                .industry(profile.getIndustry())
                .companySize(profile.getCompanySize())
                .foundedYear(profile.getFoundedYear())
                .companyType(profile.getCompanyType())
                .contactPersonName(profile.getContactPersonName())
                .contactPersonDesignation(profile.getContactPersonDesignation())
                .contactPhone(profile.getContactPhone())
                .hrEmail(profile.getHrEmail())
                .linkedInUrl(profile.getLinkedInUrl())
                .hiringForRoles(profile.getHiringForRoles())
                .officeLocations(profile.getOfficeLocations())
                .benefits(profile.getBenefits())
                .aboutCulture(profile.getAboutCulture())
                .verified(Boolean.TRUE.equals(profile.getIsVerified()))
                .hasLogo(profile.getCompanyLogo() != null && profile.getCompanyLogo().length > 0)
                .build();
    }

    // Job Management
   // Job Management
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @GetMapping("/jobs")
    @Transactional(readOnly = true) // 🚨 Keeps session open for lazy loading
    public ResponseEntity<List<AdminJobDto>> getJobs(@RequestParam(required = false) String status) {
        List<AdminJobDto> jobs = jobRepository.findAll().stream()
                .filter(j -> status == null || (j.getStatus() != null && j.getStatus().name().equalsIgnoreCase(status)))
                .map(j -> new AdminJobDto(
                        j.getId(), 
                        j.getTitle(), 
                        j.getDescription(), 
                        j.getCompanyName(), 
                        j.getStatus() != null ? j.getStatus().name() : "PENDING",
                        j.getReportCount()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobs);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @GetMapping("/jobs/reported")
    @Transactional(readOnly = true) // 🚨 Keeps session open
    public ResponseEntity<List<AdminJobDto>> getReportedJobs() {
        List<AdminJobDto> reported = jobRepository.findAll().stream()
                .filter(job -> job.getReportCount() > 0)
                .map(j -> new AdminJobDto(
                        j.getId(), 
                        j.getTitle(), 
                        j.getDescription(), 
                        j.getCompanyName(), 
                        j.getStatus() != null ? j.getStatus().name() : "PENDING",
                        j.getReportCount()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(reported);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/jobs/{jobId}/approve")
    public ResponseEntity<Map<String, String>> approveJob(@PathVariable Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(JobStatus.APPROVED);
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("message", "Job approved"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/jobs/{jobId}/reject")
    public ResponseEntity<Map<String, String>> rejectJob(@PathVariable Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(JobStatus.REJECTED);
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("message", "Job rejected"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<Job> editJob(@PathVariable Long jobId, @RequestBody JobEditRequest request) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getSalary() != null) job.setSalary(request.getSalary());
        if (request.getJobType() != null) job.setJobType(request.getJobType());
        if (request.getCategory() != null) job.setCategory(request.getCategory());
        jobRepository.save(job);
        return ResponseEntity.ok(job);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<Map<String, String>> deleteJob(@PathVariable Long jobId) {
        jobRepository.deleteById(jobId);
        return ResponseEntity.ok(Map.of("message", "Job deleted"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/jobs/{jobId}/flag-fake")
    public ResponseEntity<Map<String, String>> flagFakeJob(@PathVariable Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setFake(true);
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("message", "Job marked as fake"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/jobs/{jobId}/unflag-fake")
    public ResponseEntity<Map<String, String>> unflagFakeJob(@PathVariable Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setFake(false);
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("message", "Job removed from fake list"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/jobs/{jobId}/report")
    public ResponseEntity<Map<String, String>> reportJob(@PathVariable Long jobId, @RequestBody(required = false) Map<String, String> payload) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setReportCount(job.getReportCount() + 1);
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("message", "Job reported"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/jobs/{jobId}/clear-reports")
    public ResponseEntity<Map<String, String>> clearJobReports(@PathVariable Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setReportCount(0);
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("message", "Reports cleared"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/jobs/{jobId}/remove-description")
    public ResponseEntity<Job> removeJobDescription(@PathVariable Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setDescription("This job content has been removed by admin due to policy violations.");
        jobRepository.save(job);
        return ResponseEntity.ok(job);
    }

    // Application Monitoring
   // Application Monitoring
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @GetMapping("/applications")
    @Transactional(readOnly = true) // 🚨 ADDED THIS to fix the User mapping error!
    public ResponseEntity<List<ApplicationDto>> getApplications() {
        List<ApplicationDto> response = applicationRepository.findAll().stream().map(application -> {
            ApplicationDto.JobDto jobDto = null;
            if (application.getJob() != null) {
                jobDto = new ApplicationDto.JobDto(application.getJob().getId(), application.getJob().getTitle());
            }
            ApplicationDto.StudentDto studentDto = null;
            if (application.getStudent() != null) {
                String studentName = null;
                if (application.getStudent().getUser() != null) {
                    studentName = application.getStudent().getUser().getName();
                }
                studentDto = new ApplicationDto.StudentDto(application.getStudent().getId(), studentName);
            }
            return new ApplicationDto(
                    application.getId(),
                    jobDto,
                    studentDto,
                    application.getStatus(),
                    application.getAppliedAt()
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/applications/{applicationId}/mark-spam")
    public ResponseEntity<Map<String, String>> markApplicationSpam(@PathVariable Long applicationId) {
        Application application = applicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(com.example.platform.common.enums.ApplicationStatus.REJECTED);
        applicationRepository.save(application);
        return ResponseEntity.ok(Map.of("message", "Application marked as spam/rejected"));
    }

    // System Settings
    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(allowedCategories);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Map<String, String>> addCategory(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category name cannot be empty"));
        }
        if (!allowedCategories.contains(name)) {
            allowedCategories.add(name);
        }
        return ResponseEntity.ok(Map.of("message", "Category added"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @DeleteMapping("/categories/{name}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable String name) {
        allowedCategories.removeIf(c -> c.equalsIgnoreCase(name));
        return ResponseEntity.ok(Map.of("message", "Category removed"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @GetMapping("/job-types")
    public ResponseEntity<List<com.example.platform.common.enums.JobType>> getJobTypes() {
        return ResponseEntity.ok(Arrays.asList(com.example.platform.common.enums.JobType.values()));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @GetMapping("/feature-toggles")
    public ResponseEntity<Map<String, Boolean>> getFeatures() {
        return ResponseEntity.ok(featureToggles);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/feature-toggles/{feature}")
    public ResponseEntity<Map<String, String>> toggleFeature(@PathVariable String feature, @RequestBody FeatureToggleRequest request) {
        if (!featureToggles.containsKey(feature)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unknown feature"));
        }
        featureToggles.put(feature, request.getEnabled());
        return ResponseEntity.ok(Map.of("message", "Feature toggled"));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @GetMapping("/maintenance")
    public ResponseEntity<Map<String, Boolean>> getMaintenanceMode() {
        return ResponseEntity.ok(Map.of("maintenanceMode", featureToggles.getOrDefault("maintenanceMode", false)));
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
    @PutMapping("/maintenance")
    public ResponseEntity<Map<String, Boolean>> setMaintenanceMode(@RequestBody Map<String, Boolean> body) {
        Boolean enabled = body.get("enabled");
        if (enabled == null) {
            return ResponseEntity.badRequest().body(Map.of("maintenanceMode", featureToggles.getOrDefault("maintenanceMode", false)));
        }
        featureToggles.put("maintenanceMode", enabled);
        return ResponseEntity.ok(Map.of("maintenanceMode", enabled));
    }

    @Data
    private static class RoleUpdateRequest {
        private com.example.platform.common.enums.Role role;
    }

    @Data
    private static class JobEditRequest {
        private String title;
        private String description;
        private String location;
        private Double salary;
        private String jobType;
        private String category;
    }

    @Data
    private static class FeatureToggleRequest {
        private Boolean enabled;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    private static class ApplicationDto {
        private Long id;
        private JobDto job;
        private StudentDto student;
        private com.example.platform.common.enums.ApplicationStatus status;
        private java.time.LocalDateTime appliedAt;

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        private static class JobDto {
            private Long id;
            private String title;
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        private static class StudentDto {
            private Long id;
            private String name;
        }
    }
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    private static class AdminJobDto {
        private Long id;
        private String title;
        private String description;
        private String companyName;
        private String status;
        private int reportCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    private static class RecruiterProfileDto {
        private Long id;
        private Long userId;
        private String recruiterName;
        private String recruiterEmail;
        private String companyName;
        private String websiteUrl;
        private String companyDescription;
        private String headOfficeLocation;
        private String industry;
        private String companySize;
        private String foundedYear;
        private String companyType;
        private String contactPersonName;
        private String contactPersonDesignation;
        private String contactPhone;
        private String hrEmail;
        private String linkedInUrl;
        private String hiringForRoles;
        private String officeLocations;
        private String benefits;
        private String aboutCulture;
        private Boolean verified;
        private Boolean hasLogo;
    }
}
