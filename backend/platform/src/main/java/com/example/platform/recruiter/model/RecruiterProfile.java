package com.example.platform.recruiter.model;

import com.example.platform.auth.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "recruiter_profiles")
public class RecruiterProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to the Login Account
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String companyName;

    private String websiteUrl;
    
    @Column(columnDefinition = "TEXT")
    private String companyDescription;

    private String headOfficeLocation;

    // Company Logo (Stored as bytes, similar to Resume)
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] companyLogo;
    
    private String logoContentType; // e.g., image/png
    private boolean isVerified = false;
}