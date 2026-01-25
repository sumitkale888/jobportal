package com.example.platform.job.repository;

import com.example.platform.common.enums.JobType;
import com.example.platform.job.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    // Correct method to find jobs by recruiter email
    List<Job> findByPostedByEmailOrderByPostedAtDesc(String email);
    
    // For Dashboard Stats
    long countByPostedByEmail(String email);

   @Query("SELECT DISTINCT j FROM Job j " +
           "LEFT JOIN j.requiredSkills s " +
           "WHERE (:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:type IS NULL OR j.jobType = :type) " +
           "AND (:skill IS NULL OR LOWER(s) LIKE LOWER(CONCAT('%', :skill, '%')))")
    List<Job> searchJobs(
            @Param("title") String title,
            @Param("location") String location,
            @Param("type") JobType type,
            @Param("skill") String skill
    );
}
