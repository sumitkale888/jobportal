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
    private String jobType;
    private Double salary;
    private List<String> requiredSkills;
    private LocalDateTime postedAt;
    private String recruiterName; // Just sending the name, not the whole User object
}
