package com.example.platform.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class MatchRequest {
    @JsonProperty("resume_text")
    private String resumeText; // Fixed variable naming
    
    private List<JobItem> jobs;
}