package com.example.platform.job.service;

import com.example.platform.common.enums.JobStatus;
import com.example.platform.job.model.Job;
import com.example.platform.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JobExpiryScheduler {

    private final JobRepository jobRepository;

    @Scheduled(cron = "${jobs.expiry.cleanup-cron:0 0 2 * * *}")
    @Transactional
    public void cleanupExpiredJobs() {
        List<Job> expiredJobs = jobRepository.findByStatusNotAndExpiresAtBefore(JobStatus.REMOVED, LocalDate.now());

        if (expiredJobs.isEmpty()) {
            return;
        }

        expiredJobs.forEach(job -> job.setStatus(JobStatus.REMOVED));
        jobRepository.saveAll(expiredJobs);
    }
}
