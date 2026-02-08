package com.example.platform.student.model;

import com.example.platform.auth.model.User;
import com.example.platform.job.model.Job;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String university;
    private String degree;
    private String graduationYear;
    private Double cgpa;
    private String experience;

    private String skills; 
    private String resumeUrl;

    @Lob
    @Column(length = 10000000)
    private byte[] resumeFile;
    private String resumeFileName;
    private String resumeContentType;

    @ManyToMany
    @JoinTable(
        name = "student_saved_jobs",
        joinColumns = @JoinColumn(name = "student_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "job_id")
    )
    
    @Builder.Default 
    private List<Job> savedJobs = new ArrayList<>();
}