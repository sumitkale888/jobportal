package com.example.platform.admin.service;

import com.example.platform.admin.dto.SystemStatsDto;
import com.example.platform.application.repository.ApplicationRepository;
// import com.example.platform.auth.model.Role;
import com.example.platform.common.enums.*;
import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.job.repository.JobRepository;
import com.example.platform.recruiter.model.RecruiterProfile;
import com.example.platform.recruiter.repository.RecruiterProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final RecruiterProfileRepository recruiterRepository;

    // 1. Get System Stats
    public SystemStatsDto getSystemStats() {
        long totalUsers = userRepository.count();
        long students = userRepository.findAll().stream().filter(u -> u.getRole() == Role.STUDENT).count();
        long recruiters = userRepository.findAll().stream().filter(u -> u.getRole() == Role.RECRUITER).count();
        long jobs = jobRepository.count();
        long applications = applicationRepository.count();

        return SystemStatsDto.builder()
                .totalUsers(totalUsers)
                .totalStudents(students)
                .totalRecruiters(recruiters)
                .totalJobs(jobs)
                .totalApplications(applications)
                .build();
    }

    // 2. Get All Users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 3. Delete (Ban) User
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    // 4. Verify Recruiter
    @Transactional
    public String verifyRecruiter(Long userId) {
        RecruiterProfile profile = recruiterRepository.findByUserEmail(
                userRepository.findById(userId).orElseThrow().getEmail()
        ).orElseThrow(() -> new RuntimeException("Recruiter Profile not found"));

        profile.setVerified(true);
        recruiterRepository.save(profile);
        return "Recruiter Verified Successfully!";
    }
}