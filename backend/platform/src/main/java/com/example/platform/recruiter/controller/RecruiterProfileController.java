package com.example.platform.recruiter.controller;

import com.example.platform.recruiter.dto.RecruiterDashboardDto;
import com.example.platform.recruiter.model.RecruiterProfile;
import com.example.platform.recruiter.service.RecruiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RecruiterProfileController {

    private final RecruiterService recruiterService;

    // Create/Update Company Profile (with Logo)
    @PostMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<RecruiterProfile> updateProfile(
            @RequestParam("companyName") String companyName,
            @RequestParam("website") String website,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam(value = "industry", required = false) String industry,
            @RequestParam(value = "companySize", required = false) String companySize,
            @RequestParam(value = "foundedYear", required = false) String foundedYear,
            @RequestParam(value = "companyType", required = false) String companyType,
            @RequestParam(value = "contactPersonName", required = false) String contactPersonName,
            @RequestParam(value = "contactPersonDesignation", required = false) String contactPersonDesignation,
            @RequestParam(value = "contactPhone", required = false) String contactPhone,
            @RequestParam(value = "hrEmail", required = false) String hrEmail,
            @RequestParam(value = "linkedInUrl", required = false) String linkedInUrl,
            @RequestParam(value = "hiringForRoles", required = false) String hiringForRoles,
            @RequestParam(value = "officeLocations", required = false) String officeLocations,
            @RequestParam(value = "benefits", required = false) String benefits,
            @RequestParam(value = "aboutCulture", required = false) String aboutCulture,
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            Principal principal
    ) {
        try {
            RecruiterProfile request = RecruiterProfile.builder()
                    .companyName(companyName)
                    .websiteUrl(website)
                    .companyDescription(description)
                    .headOfficeLocation(location)
                .industry(industry)
                .companySize(companySize)
                .foundedYear(foundedYear)
                .companyType(companyType)
                .contactPersonName(contactPersonName)
                .contactPersonDesignation(contactPersonDesignation)
                .contactPhone(contactPhone)
                .hrEmail(hrEmail)
                .linkedInUrl(linkedInUrl)
                .hiringForRoles(hiringForRoles)
                .officeLocations(officeLocations)
                .benefits(benefits)
                .aboutCulture(aboutCulture)
                    .build();

            return ResponseEntity.ok(recruiterService.updateProfile(request, logo, principal.getName()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get My Profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<RecruiterProfile> getProfile(Principal principal) {
        return ResponseEntity.ok(recruiterService.getProfile(principal.getName()));
    }

    // Get Dashboard Stats
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<RecruiterDashboardDto> getDashboard(Principal principal) {
        return ResponseEntity.ok(recruiterService.getDashboardStats(principal.getName()));
    }
}