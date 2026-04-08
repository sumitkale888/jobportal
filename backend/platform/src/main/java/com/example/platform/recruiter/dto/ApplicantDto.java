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
    private String phone;
    private String location;
    private String headline;
    private String about;
    private String university;
    private String degree;
    private String graduationYear;
    private String specialization;
    private String currentSemester;
    private String courseType;
    private Double cgpa;
    private String skills;
    private String experience;
    private String projects;
    private String certifications;
    private String achievements;
    private String preferredRoles;
    private String languages;
    private String links;
    private String resumeUrl; // Google Drive Link
    private ApplicationStatus status; // APPLIED, SHORTLISTED, REJECTED, INTERVIEW_SCHEDULED
    private LocalDateTime interviewDateTime;
    private String interviewLocation;
    private String interviewLink;
    private LocalDateTime appliedAt;
}