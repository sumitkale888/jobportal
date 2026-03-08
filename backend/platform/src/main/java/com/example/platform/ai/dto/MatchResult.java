package com.example.platform.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MatchResult {
    @JsonProperty("job_id")
    private Long jobId;
    
    @JsonProperty("match_score")
    private Double matchScore;
}