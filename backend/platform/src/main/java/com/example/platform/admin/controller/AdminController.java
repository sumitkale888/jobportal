package com.example.platform.admin.controller;

import com.example.platform.admin.dto.SystemStatsDto;
import com.example.platform.admin.service.AdminService;
import com.example.platform.auth.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;

    // Get Dashboard Numbers
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    // Get All Users List
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // Ban a User
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // Approve a Recruiter
    @PutMapping("/recruiters/{userId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> verifyRecruiter(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.verifyRecruiter(userId));
    }
}