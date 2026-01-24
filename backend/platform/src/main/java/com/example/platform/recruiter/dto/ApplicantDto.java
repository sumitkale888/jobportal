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
    private String name;
    private String email;
    private String university;
    private String degree;
    private Double cgpa;
    private String skills;
    private String experience;
    private String resumeUrl; // Google Drive Link
    private ApplicationStatus status; // APPLIED, SHORTLISTED, REJECTED
    private LocalDateTime appliedAt;
}