package com.example.platform.ai.controller;

import com.example.platform.ai.dto.AiExtractResponse;
import com.example.platform.ai.dto.MatchResult;
import com.example.platform.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    private final AiService aiService;

    // 1. Endpoint to test extraction
    @GetMapping("/test-extract/{studentId}")
    public ResponseEntity<Map<String, String>> testExtract(@PathVariable Long studentId) {
        String text = aiService.extractTextFromResume(studentId);
        Map<String, String> response = new HashMap<>();
        response.put("extracted_text", text);
        return ResponseEntity.ok(response);
    }

    // 2. 🚨 THE MISSING ENDPOINT FOR REACT 🚨
    @GetMapping("/match-jobs/{studentId}")
    public ResponseEntity<List<MatchResult>> getMatchingJobs(@PathVariable Long studentId) {
        List<MatchResult> matches = aiService.findMatchingJobsForStudent(studentId);
        return ResponseEntity.ok(matches);
    }

    @PostMapping("/extract-skills")
    public ResponseEntity<Map<String, Object>> extractSkills(@RequestBody Map<String, Object> body) {
        if (!body.containsKey("resume_text")) {
            return ResponseEntity.badRequest().body(Map.of("error", "resume_text is required"));
        }
        String resumeText = body.get("resume_text").toString();
        Map<String, Object> result = aiService.extractSkillsFromText(resumeText);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/match-resume")
    public ResponseEntity<Map<String, Object>> matchResume(@RequestBody Map<String, Object> body) {
        try {
            String resumeText = body.getOrDefault("resume_text", "").toString();
            List<String> requiredSkills = body.containsKey("required_skills")
                    ? (List<String>) body.get("required_skills")
                    : new ArrayList<>();
            Map<String, Object> result = aiService.matchResumeWithJobSkills(resumeText, requiredSkills);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request format", "details", e.getMessage()));
        }
    }

    @GetMapping("/rank-candidates/{jobId}")
    public ResponseEntity<Map<String, Object>> rankCandidates(@PathVariable Long jobId) {
        List<Map<String, Object>> ranked = aiService.rankCandidatesForJob(jobId);
        return ResponseEntity.ok(Map.of("job_id", jobId, "ranked_candidates", ranked));
    }
}
