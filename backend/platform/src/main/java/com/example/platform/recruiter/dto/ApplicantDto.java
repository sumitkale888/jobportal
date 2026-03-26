package com.example.platform.recruiter.dto;

import com.example.platform.common.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ApplicantDto {
    private Long applicationId;
    private Long studentId;
    private Long studentUserId;
    private String name;
    private String email;
    private String university;
    private String degree;
    private Double cgpa;
    private String skills;
    private String experience;
    private String resumeUrl; // Google Drive Link
    private ApplicationStatus status; // APPLIED, SHORTLISTED, REJECTED, INTERVIEW_SCHEDULED
    private LocalDateTime interviewDateTime;
    private String interviewLocation;
    private String interviewLink;
    private LocalDateTime appliedAt;
}