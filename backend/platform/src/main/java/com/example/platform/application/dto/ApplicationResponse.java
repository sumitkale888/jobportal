package com.example.platform.application.dto;

import com.example.platform.common.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationResponse {
    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String applicantName;
    private String applicantEmail;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
}