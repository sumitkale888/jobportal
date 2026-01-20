package com.example.platform.notification.service;

import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.notification.model.Notification;
import com.example.platform.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
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

    // The Main Method to trigger a notification
    @Async // Run in background so it doesn't slow down the main app
    public void sendNotification(String recipientEmail, String subject, String messageBody) {
        User user = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Save to Database (In-App Notification)
        Notification notification = Notification.builder()
                .recipient(user)
                .subject(subject)
                .message(messageBody)
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        // 2. Send Real Email
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom("YOUR_REAL_EMAIL@gmail.com");
            email.setTo(recipientEmail);
            email.setSubject(subject);
            email.setText(messageBody);
            mailSender.send(email); // <--- Uncomment this line when you have real SMTP config
            System.out.println("EMAILING " + recipientEmail + ": " + subject); // For testing
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
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