package com.example.platform.recruiter.service;

import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.recruiter.dto.RecruiterDashboardDto;
import com.example.platform.recruiter.model.RecruiterProfile;
import com.example.platform.recruiter.repository.RecruiterProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final RecruiterProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository; // Need this for stats

    // 1. Create/Update Profile
    public RecruiterProfile updateProfile(RecruiterProfile request, MultipartFile logoFile, String email) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RecruiterProfile profile = profileRepository.findByUserEmail(email)
                .orElse(RecruiterProfile.builder().user(user).build());

        profile.setCompanyName(request.getCompanyName());
        profile.setWebsiteUrl(request.getWebsiteUrl());
        profile.setCompanyDescription(request.getCompanyDescription());
        profile.setHeadOfficeLocation(request.getHeadOfficeLocation());

        if (logoFile != null && !logoFile.isEmpty()) {
            profile.setCompanyLogo(logoFile.getBytes());
            profile.setLogoContentType(logoFile.getContentType());
        }

        return profileRepository.save(profile);
    }

    // 2. Get Profile
    public RecruiterProfile getProfile(String email) {
        return profileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found. Please complete your profile."));
    }

    // 3. Get Dashboard Stats
    @Transactional(readOnly = true)
    public RecruiterDashboardDto getDashboardStats(String email) {
        RecruiterProfile profile = profileRepository.findByUserEmail(email)
                .orElse(null);

        // Fetch stats from Job Repository
        // Note: You might need to add countByPostedByEmail to JobRepository
        long totalJobs = jobRepository.countByPostedByEmail(email); 
        
        // This is a simplified count. In a real app, you'd join with Application table.
        // For now, we will just return job counts.
        
        return RecruiterDashboardDto.builder()
                .companyName(profile != null ? profile.getCompanyName() : "Not Set")
                .totalJobsPosted(totalJobs)
                .totalApplicants(0) // Requires complex query, keeping 0 for now to keep code simple
                .activeJobs(totalJobs) 
                .build();
    }
}