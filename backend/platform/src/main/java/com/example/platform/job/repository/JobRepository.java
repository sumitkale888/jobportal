package com.example.platform.job.repository;

import com.example.platform.job.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    // Correct method to find jobs by recruiter email
    List<Job> findByPostedByEmailOrderByPostedAtDesc(String email);
    
    // For Dashboard Stats
    long countByPostedByEmail(String email);
}