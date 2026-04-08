package com.example.platform.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDto {
    private Long id;
    private String name;
    private String email;

    private String phone;
    private String location;
    private String headline;
    private String about;
   
    private String university;
    private String degree;
    private String graduationYear;
    private Double cgpa;
    private String specialization;
    private String currentSemester;
    private String courseType;

    private String experience;
    private String projects;
    private String certifications;
    private String achievements;
    private String preferredRoles;
    private String languages;
    private String links;
    private String resumeUrl;

    private String skills;
    private String resumeFileName;
    private Integer profileCompletionPercentage;
    private List<String> missingProfileSections;
}