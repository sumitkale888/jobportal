package com.example.platform.application.repository;

import com.example.platform.application.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    // Check for duplicates
    boolean existsByJobIdAndStudentId(Long jobId, Long studentId);

    // For Student Dashboard: See my applications
    List<Application> findByStudentId(Long studentId);

    // For Recruiter Dashboard: See who applied to my job
    List<Application> findByJobId(Long jobId);
}