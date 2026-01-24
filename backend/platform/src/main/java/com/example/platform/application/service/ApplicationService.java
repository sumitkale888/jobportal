package com.example.platform.application.service;

import com.example.platform.application.dto.ApplicationResponse;
import com.example.platform.application.model.Application;
import com.example.platform.application.repository.ApplicationRepository;
import com.example.platform.common.enums.ApplicationStatus;
import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.recruiter.dto.ApplicantDto; // ✅ Import ApplicantDto
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

    // 1. STUDENT: Apply for a Job
    @Transactional
    public String applyForJob(Long jobId, String studentEmail) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudentProfile student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found. Please complete profile first."));

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
        return "Application submitted successfully!";
    }

    // 2. STUDENT: Get My Applications
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getStudentApplications(String studentEmail) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudentProfile student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        return applicationRepository.findByStudentId(student.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 3. RECRUITER: Get Detailed Applicants for a Job (Corrected Method)
    @Transactional(readOnly = true)
    public List<ApplicantDto> getApplicantsForJob(Long jobId, String recruiterEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getPostedBy().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("Unauthorized: You did not post this job.");
        }

        return applicationRepository.findByJobId(jobId).stream()
                .map(app -> ApplicantDto.builder()
                        .applicationId(app.getId())
                        .studentId(app.getStudent().getId())
                        .name(app.getStudent().getUser().getName())
                        .email(app.getStudent().getUser().getEmail())
                        .university(app.getStudent().getUniversity())
                        .degree(app.getStudent().getDegree())
                        .cgpa(app.getStudent().getCgpa())
                        .skills(app.getStudent().getSkills())
                        .experience(app.getStudent().getExperience())
                        .resumeUrl(app.getStudent().getResumeUrl())
                        .status(app.getStatus())
                        .appliedAt(app.getAppliedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // 4. RECRUITER: Update Status
    @Transactional
    public String updateApplicationStatus(Long applicationId, ApplicationStatus newStatus, String recruiterEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getPostedBy().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("Unauthorized: You cannot update this application.");
        }

        application.setStatus(newStatus);
        applicationRepository.save(application);
        return "Status updated to " + newStatus;
    }

    // Helper: Map Entity to DTO (For Student View)
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