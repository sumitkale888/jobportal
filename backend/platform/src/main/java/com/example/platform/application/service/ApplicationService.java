package com.example.platform.application.service;

import com.example.platform.application.dto.ApplicationResponse;
import com.example.platform.application.model.Application;
import com.example.platform.application.repository.ApplicationRepository;
import com.example.platform.common.enums.ApplicationStatus;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.notification.service.NotificationService; // <--- Import NotificationService
import com.example.platform.student.model.StudentProfile;
import com.example.platform.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final StudentProfileRepository studentRepository;
    private final NotificationService notificationService; // <--- Inject the Service

    // 1. STUDENT: Apply for a Job
    @Transactional
    public String applyForJob(Long jobId, String studentEmail) {
        // 1. Fetch Student Profile
        StudentProfile student = studentRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student profile not found. Please complete profile first."));

        // 2. Fetch Job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // 3. Check for Duplicate Application
        if (applicationRepository.existsByJobIdAndStudentId(jobId, student.getId())) {
            throw new RuntimeException("You have already applied for this job.");
        }

        // 4. Save Application
        Application application = Application.builder()
                .job(job)
                .student(student)
                .status(ApplicationStatus.APPLIED) // Default status
                .build();

        applicationRepository.save(application);

        // --- EMAIL TRIGGER START ---
        // Send Email to the Recruiter saying "Hey, someone applied!"
        String recruiterEmail = job.getPostedBy().getEmail();
        String subject = "New Applicant for: " + job.getTitle();
        String message = "Hello,\n\nA new student named " + student.getUser().getName() + 
                         " has applied for your job post: " + job.getTitle() + ".\n\n" +
                         "Check your dashboard to view their resume.";

        notificationService.sendNotification(recruiterEmail, subject, message);
        // --- EMAIL TRIGGER END ---

        return "Application submitted successfully!";
    }

    // 2. STUDENT: Get My Applications
    public List<ApplicationResponse> getStudentApplications(String studentEmail) {
        StudentProfile student = studentRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return applicationRepository.findByStudentId(student.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 3. RECRUITER: Get Applicants for a specific Job
    public List<ApplicationResponse> getApplicantsForJob(Long jobId, String recruiterEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getPostedBy().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("Unauthorized: You did not post this job.");
        }

        return applicationRepository.findByJobId(jobId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 4. RECRUITER: Update Application Status
    @Transactional
    public String updateApplicationStatus(Long applicationId, ApplicationStatus newStatus, String recruiterEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getPostedBy().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("Unauthorized: You cannot update this application.");
        }

        application.setStatus(newStatus);
        applicationRepository.save(application);

        // --- EMAIL TRIGGER START ---
        // Send Email to the Student when status changes (e.g., Shortlisted)
        String studentEmail = application.getStudent().getUser().getEmail();
        String subject = "Update on your application for " + application.getJob().getTitle();
        String message = "Hello " + application.getStudent().getUser().getName() + ",\n\n" +
                         "Your application status for " + application.getJob().getTitle() + 
                         " has been updated to: " + newStatus + ".";

        notificationService.sendNotification(studentEmail, subject, message);
        // --- EMAIL TRIGGER END ---

        return "Status updated to " + newStatus;
    }

    // Helper Method to convert Entity to DTO
    private ApplicationResponse mapToResponse(Application app) {
        return ApplicationResponse.builder()
                .applicationId(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .companyName(app.getJob().getCompanyName())
                .applicantName(app.getStudent().getUser().getName())
                .applicantEmail(app.getStudent().getUser().getEmail())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .build();
    }
}