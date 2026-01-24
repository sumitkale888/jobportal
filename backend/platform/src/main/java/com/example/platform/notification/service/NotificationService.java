package com.example.platform.notification.service;

import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.notification.model.Notification;
import com.example.platform.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Inject the email from application.properties to avoid hardcoding
    @Value("${spring.mail.username}")
    private String senderEmail;

    @Async // Runs in background so the user doesn't wait for email to send
    public void sendNotification(String recipientEmail, String subject, String messageBody) {
        User user = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Save In-App Notification (Database)
        Notification notification = Notification.builder()
                .recipient(user)
                .subject(subject)
                .message(messageBody)
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        // 2. Send Real Email (SMTP)
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(senderEmail);
            email.setTo(recipientEmail);
            email.setSubject(subject);
            email.setText(messageBody);
            
            mailSender.send(email); // ✅ This sends the actual email!
            
            System.out.println("✅ Email Sent Successfully to: " + recipientEmail);
        } catch (Exception e) {
            // Log error but don't crash the application
            System.err.println("❌ Failed to send email to " + recipientEmail + ": " + e.getMessage());
        }
    }

    // Get my notifications
    public List<Notification> getMyNotifications(String email) {
        return notificationRepository.findByRecipientEmailOrderBySentAtDesc(email);
    }

    // Mark as Read
    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id).orElse(null);
        if (n != null) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }
}