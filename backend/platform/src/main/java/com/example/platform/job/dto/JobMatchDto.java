package com.example.platform.job.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobMatchDto {
    private JobResponse job;
    private int matchPercentage;
    private String matchStatus;
}