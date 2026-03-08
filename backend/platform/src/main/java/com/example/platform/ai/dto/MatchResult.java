package com.example.platform.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List; // 🚨 THIS WAS MISSING!

@Data
public class MatchResult {
    @JsonProperty("job_id")
    private Long jobId;
    
    @JsonProperty("match_score")
    private Double matchScore;

    @JsonProperty("matched_skills")
    private List<String> matchedSkills;

    @JsonProperty("missing_skills")
    private List<String> missingSkills;
}