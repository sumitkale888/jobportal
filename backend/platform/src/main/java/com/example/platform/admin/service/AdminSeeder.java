package com.example.platform.admin.service;
import  com.example.platform.common.enums.Role;// Make sure this matches your Role import
import com.example.platform.auth.model.User; // Make sure this matches your User import
import com.example.platform.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if the admin already exists so we don't create duplicates
        if (userRepository.findByEmail("ranjithdeshpande414@gmail.com").isEmpty()) {
            
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("ranjithdeshpande414@gmail.com");
            // Set a secure default password. You will use this to log in!
            admin.setPassword(passwordEncoder.encode("Sumit@2006")); 
            admin.setRole(Role.ADMIN); // Assign the god-tier role
            
            userRepository.save(admin);
            
            System.out.println("✅ SUPER ADMIN ACCOUNT CREATED: ranjithdeshpande414@gmail.com / Sumit@2006");
        }
    }
}