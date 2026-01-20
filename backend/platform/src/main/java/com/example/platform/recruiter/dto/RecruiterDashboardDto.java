package com.example.platform.recruiter.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecruiterDashboardDto {
    private String companyName;
    private long totalJobsPosted;
    private long totalApplicants;
    private long activeJobs;
}