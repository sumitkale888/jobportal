package com.example.platform.recruiter.repository;

import com.example.platform.recruiter.model.RecruiterProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, Long> {
    Optional<RecruiterProfile> findByUserEmail(String email);
}