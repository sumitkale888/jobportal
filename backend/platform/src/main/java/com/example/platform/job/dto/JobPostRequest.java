package com.example.platform.job.dto;



import lombok.Data;
import java.util.List;

@Data
public class JobPostRequest {
    private String title;
    private String description;
    private String companyName;
    private String location;
    private String jobType;
    private Double salary;
    private List<String> requiredSkills;
}