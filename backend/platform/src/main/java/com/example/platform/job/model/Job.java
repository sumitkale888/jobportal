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

    private String title;
    
    @Column(length = 2000) 
    private String description;
    
    private String companyName;
    private String location;
    private Double salary;

    private String jobType;

    // ✅ FIX: Add (fetch = FetchType.EAGER)
    // This forces the "skills" to load immediately, preventing the 500 Error.
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> requiredSkills;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id")
    private User postedBy;

    @CreationTimestamp
    private LocalDateTime postedAt;
}