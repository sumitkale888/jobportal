package com.example.platform.job.model;

import com.example.platform.auth.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", length = 5000, nullable = false)
    private String description;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String jobType;

    @Column(nullable = false)
    private Double salary;

    // ✅ FIX 1: Change to EAGER so skills are always loaded
    @ElementCollection(fetch = FetchType.EAGER) 
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> requiredSkills;

    @CreationTimestamp
    private LocalDateTime postedAt;

    // ✅ FIX 2: Change to EAGER so Recruiter Name is always loaded
    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User postedBy;
}