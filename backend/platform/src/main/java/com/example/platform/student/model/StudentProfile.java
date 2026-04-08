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

    private String phone;
    private String location;
    private String headline;
    @Column(length = 2000)
    private String about;

    private String university;
    private String degree;
    private String graduationYear;
    private Double cgpa;
    private String specialization;
    private String currentSemester;
    private String courseType;

    @Column(length = 2000)
    private String experience;
    @Column(length = 4000)
    private String projects;
    @Column(length = 2000)
    private String certifications;
    @Column(length = 2000)
    private String achievements;
    private String preferredRoles;
    private String languages;
    @Column(length = 2000)
    private String links;
    private String skills;

    // ✅ FIXED: Only using these three fields for the PDF file
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] resumeData;
    
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