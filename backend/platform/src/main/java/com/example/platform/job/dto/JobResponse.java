package com.example.platform.job.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private String location;
    private Double salary;
    
    // ✅ String to match Entity
    private String jobType; 
    
    private List<String> requiredSkills;
    private LocalDateTime postedAt;
    
    // ✅ Added to fix "undefined method" error
    private String postedByEmail; 
    private String recruiterName;
    private String companyLogo;       // Base64 Encoded String
    private String logoContentType;
}