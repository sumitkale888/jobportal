package com.example.platform.job.repository;

import com.example.platform.job.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    // For Students: Get all jobs (built-in findAll)
    
    // For Recruiters: Get only their posted jobs
    List<Job> findByPostedById(Long recruiterId);
    long countByPostedByEmail(String email);
}
