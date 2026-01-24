package com.example.platform.job.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {
    private String title;
    private String description;
    private String companyName;
    private String location;
    private Double salary;
    
    // ✅ String ensures compatibility with existing DB data
    private String jobType; 
    
    private List<String> requiredSkills;
}