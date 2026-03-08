package com.example.platform.ai.controller;

import com.example.platform.ai.dto.AiExtractResponse;
import com.example.platform.ai.dto.MatchResult;
import com.example.platform.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}