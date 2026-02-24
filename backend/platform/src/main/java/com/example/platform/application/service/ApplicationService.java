package com.example.platform.application.service;

import com.example.platform.application.dto.ApplicationResponse;
import com.example.platform.application.model.Application;
import com.example.platform.application.repository.ApplicationRepository;
import com.example.platform.common.enums.ApplicationStatus;
import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.recruiter.dto.ApplicantDto;
import com.example.platform.notification.service.NotificationService;
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
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public String applyForJob(Long jobId, String studentEmail) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudentProfile student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found."));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (applicationRepository.existsByJobIdAndStudentId(jobId, student.getId())) {
            throw new RuntimeException("You have already applied for this job.");
        }

        Application application = Application.builder()
                .job(job)
                .student(student)
                .status(ApplicationStatus.APPLIED)
                .build();

        applicationRepository.save(application);

        // Notify Recruiter
        if (job.getPostedBy() != null) {
            String recruiterEmail = job.getPostedBy().getEmail();
            String subject = "New Applicant: " + job.getTitle();
            String message = "Student " + student.getUser().getName() + " has applied for your job post: " + job.getTitle();
            notificationService.sendNotification(recruiterEmail, subject, message);
        }

        return "Application submitted successfully!";
    }

    @Transactional
    public String updateApplicationStatus(Long applicationId, ApplicationStatus newStatus, String recruiterEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getPostedBy().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("Unauthorized: You cannot update this application.");
        }

        application.setStatus(newStatus);
        applicationRepository.save(application);

        // Notify Student
        String studentEmail = application.getStudent().getUser().getEmail();
        String jobTitle = application.getJob().getTitle();
        String subject = "Application Update: " + jobTitle;
        
        String message = "Your application status has been updated to: " + newStatus;
        if (newStatus == ApplicationStatus.SHORTLISTED) {
            message = "Congratulations! You have been SHORTLISTED for " + jobTitle;
        } else if (newStatus == ApplicationStatus.REJECTED) {
            message = "Update on your application for " + jobTitle + ". We have decided not to move forward.";
        }

        notificationService.sendNotification(studentEmail, subject, message);

        return "Status updated to " + newStatus;
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getStudentApplications(String studentEmail) {
        User user = userRepository.findByEmail(studentEmail).orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile student = studentRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Student profile not found"));
        return applicationRepository.findByStudentId(student.getId()).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicantDto> getApplicantsForJob(Long jobId, String recruiterEmail) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getPostedBy().getEmail().equals(recruiterEmail)) throw new RuntimeException("Unauthorized");
        
        return applicationRepository.findByJobId(jobId).stream().map(app -> ApplicantDto.builder()
                .applicationId(app.getId())
                .studentId(app.getStudent().getId())
                .name(app.getStudent().getUser().getName())
                .email(app.getStudent().getUser().getEmail())
                .university(app.getStudent().getUniversity())
                .degree(app.getStudent().getDegree())
                .cgpa(app.getStudent().getCgpa())
                .skills(app.getStudent().getSkills())
                .experience(app.getStudent().getExperience())
                // ✅ Passes filename. If null, frontend won't show the "View PDF" button
                .resumeUrl(app.getStudent().getResumeFileName()) 
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .build()).collect(Collectors.toList());
    }

    private ApplicationResponse mapToResponse(Application app) {
        return ApplicationResponse.builder().applicationId(app.getId()).jobId(app.getJob().getId()).jobTitle(app.getJob().getTitle()).companyName(app.getJob().getCompanyName()).applicantName(app.getStudent().getUser().getName()).applicantEmail(app.getStudent().getUser().getEmail()).status(app.getStatus()).appliedAt(app.getAppliedAt()).build();
    }
    
    @Transactional
    public void withdrawApplication(Long applicationId, String studentEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getStudent().getUser().getEmail().equals(studentEmail)) {
            throw new RuntimeException("Unauthorized: You cannot withdraw this application.");
        }

        if (application.getStatus() == ApplicationStatus.SHORTLISTED || 
            application.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED) {
            throw new RuntimeException("Cannot withdraw application. You are shortlisted/interviewing.");
        }

        applicationRepository.delete(application);
    }
}