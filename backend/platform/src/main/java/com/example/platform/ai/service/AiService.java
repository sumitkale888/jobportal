package com.example.platform.ai.service;

import com.example.platform.ai.dto.AiExtractResponse;
import com.example.platform.ai.dto.JobItem;
import com.example.platform.ai.dto.MatchRequest;
import com.example.platform.ai.dto.MatchResult;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.student.model.StudentProfile;
import com.example.platform.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    private final StudentProfileRepository studentProfileRepository;
    private final JobRepository jobRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public String extractTextFromResume(Long studentId) {
        StudentProfile profile = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (profile.getResumeData() == null) {
            throw new RuntimeException("No resume PDF found for this student");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        
        ByteArrayResource resource = new ByteArrayResource(profile.getResumeData()) {
            @Override
            public String getFilename() {
                return profile.getResumeFileName() != null ? profile.getResumeFileName() : "resume.pdf";
            }
        };
        
        body.add("file", resource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<AiExtractResponse> response = restTemplate.postForEntity(
                "http://localhost:5000/extract-resume", 
                requestEntity, 
                AiExtractResponse.class
        );

        if (response.getBody() != null && response.getBody().getError() != null) {
            throw new RuntimeException("Python AI Error: " + response.getBody().getError());
        }

        String extractedText = response.getBody() != null ? response.getBody().getText() : "No text extracted";
        
        System.out.println("=== PDF EXTRACTION TEST ===");
        System.out.println("Resume Length: " + extractedText.length() + " characters");
        System.out.println("===========================");

        return extractedText;
    }

    public List<MatchResult> findMatchingJobsForStudent(Long studentId) {
        String resumeText = extractTextFromResume(studentId);

        List<Job> allJobs = jobRepository.findAll();
        
        List<JobItem> jobItems = allJobs.stream()
            .map(job -> {
                String combinedText = job.getTitle() + " " + job.getDescription();
                
                // Safely convert skills to a plain string, whether your DB stores it as a String or a List
                String skillsString = job.getRequiredSkills() != null 
                    ? job.getRequiredSkills().toString().replace("[", "").replace("]", "") 
                    : "";
                
                if (!skillsString.isEmpty()) {
                    combinedText += " " + skillsString;
                }
                
                // 🚨 NEW: Passing the 3rd argument (skillsString) to Python for Insights
                return new JobItem(job.getId(), combinedText, skillsString);
            })
            .collect(Collectors.toList());

        System.out.println("=== AI JOB MATCHING ===");
        System.out.println("Sending " + jobItems.size() + " jobs to Python for matching!");
        System.out.println("=======================");

        MatchRequest request = new MatchRequest(resumeText, jobItems);
        
        try {
            ResponseEntity<MatchResult[]> response = restTemplate.postForEntity(
                "http://localhost:5000/match-jobs", 
                request, 
                MatchResult[].class
            );
            return response.getBody() != null ? Arrays.asList(response.getBody()) : new ArrayList<>();
        } catch (Exception e) {
            System.err.println("❌ ERROR CALLING PYTHON AI: " + e.getMessage());
            return new ArrayList<>(); // Safely return no matches instead of crashing
        }
    }
}