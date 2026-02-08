package com.example.platform.auth.service;

import com.example.platform.auth.dto.AuthResponse;
import com.example.platform.auth.dto.LoginRequest;
import com.example.platform.auth.dto.RegisterRequest;
import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.common.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map; 

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);

       
        var jwtToken = jwtUtils.generateToken(Map.of("role", user.getRole()), user); 
        
        return AuthResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
       
        var jwtToken = jwtUtils.generateToken(Map.of("role", user.getRole()), user);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}