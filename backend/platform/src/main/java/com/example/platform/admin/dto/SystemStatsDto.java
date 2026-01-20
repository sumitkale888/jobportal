package com.example.platform.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SystemStatsDto {
    private long totalUsers;
    private long totalStudents;
    private long totalRecruiters;
    private long totalJobs;
    private long totalApplications;
}