package com.example.platform.ai.service;

import com.example.platform.ai.dto.AiExtractResponse;
import com.example.platform.ai.dto.JobItem;
import com.example.platform.ai.dto.MatchRequest;
import com.example.platform.ai.dto.MatchResult;
import com.example.platform.application.repository.ApplicationRepository;
import com.example.platform.application.model.Application;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.student.model.StudentProfile;
import com.example.platform.student.repository.StudentProfileRepository;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 🚨 ADDED THIS IMPORT
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
    private final ApplicationRepository applicationRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional(readOnly = true) // 🚨 KEEPS SESSION OPEN FOR PDF LOB DATA
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

    @Transactional(readOnly = true) // 🚨 KEEPS SESSION OPEN TO READ SKILLS
    public List<MatchResult> findMatchingJobsForStudent(Long studentId) {
        String resumeText = extractTextFromResume(studentId);

        List<Job> allJobs = jobRepository.findAll();
        
        List<JobItem> jobItems = allJobs.stream()
            .map(job -> {
                String combinedText = job.getTitle() + " " + job.getDescription();
                
                // Safely convert skills to a plain string
                String skillsString = job.getRequiredSkills() != null 
                    ? job.getRequiredSkills().toString().replace("[", "").replace("]", "") 
                    : "";
                
                if (!skillsString.isEmpty()) {
                    combinedText += " " + skillsString;
                }
                
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
            return new ArrayList<>(); 
        }
    }

    public Map<String, Object> extractSkillsFromText(String text) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("resume_text", text);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "http://localhost:5000/extract-skills",
                payload,
                Map.class
            );
            return response.getBody() != null ? response.getBody() : Map.of("skills", new ArrayList<>());
        } catch (Exception e) {
            System.err.println("❌ ERROR CALLING PYTHON AI (extract-skills): " + e.getMessage());
            return Map.of("skills", new ArrayList<>());
        }
    }

    public Map<String, Object> matchResumeWithJobSkills(String resumeText, List<String> requiredSkills) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("resume_text", resumeText);
        payload.put("required_skills", requiredSkills);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "http://localhost:5000/match-resume",
                payload,
                Map.class
            );
            return response.getBody() != null ? response.getBody() : Map.of(
                "matched_skills", new ArrayList<>(),
                "missing_skills", new ArrayList<>(),
                "match_percentage", 0.0
            );
        } catch (Exception e) {
            System.err.println("❌ ERROR CALLING PYTHON AI (match-resume): " + e.getMessage());
            return Map.of(
                "matched_skills", new ArrayList<>(),
                "missing_skills", new ArrayList<>(),
                "match_percentage", 0.0
            );
        }
    }

    @Transactional(readOnly = true) // 🚨 FIXES THE 500 ERROR BY KEEPING DB SESSION ALIVE
    public List<Map<String, Object>> rankCandidatesForJob(Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        List<Application> applications = applicationRepository.findByJobId(jobId);
        List<Map<String, Object>> candidateMatches = new ArrayList<>();

        List<String> requiredSkills = job.getRequiredSkills() != null ? job.getRequiredSkills() : new ArrayList<>();

        for (Application app : applications) {
            StudentProfile student = app.getStudent();
            if (student == null) continue;
            String resumeText;
            try {
                resumeText = extractTextFromResume(student.getId());
            } catch (Exception e) {
                resumeText = "";
            }

            Map<String, Object> match = matchResumeWithJobSkills(resumeText, requiredSkills);
            Map<String, Object> candidateMap = new HashMap<>();
            candidateMap.put("candidate_id", student.getId());
            candidateMap.put("name", student.getUser() != null ? student.getUser().getName() : "Unknown"); // Changed to getName() for cleaner UI
            candidateMap.put("matched_skills", match.getOrDefault("matched_skills", new ArrayList<>()));
            candidateMap.put("missing_skills", match.getOrDefault("missing_skills", new ArrayList<>()));
            candidateMap.put("match_percentage", match.getOrDefault("match_percentage", 0.0));
            candidateMatches.add(candidateMap);
        }

        candidateMatches.sort((a, b) -> {
            Double scoreA = ((Number) a.getOrDefault("match_percentage", 0)).doubleValue();
            Double scoreB = ((Number) b.getOrDefault("match_percentage", 0)).doubleValue();
            return scoreB.compareTo(scoreA);
        });

        int rank = 1;
        for (Map<String, Object> candidate : candidateMatches) {
            candidate.put("candidate_rank", rank++);
        }

        return candidateMatches;
    }
}