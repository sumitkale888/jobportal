package com.example.platform.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDto {
    private String name;
    private String email;
    
    // ✅ NEW FIELDS (These were missing!)
    private String university;
    private String degree;
    private String graduationYear;
    private Double cgpa;
    private String experience;
    
    private String skills; 
    private String resumeFileName; 
}