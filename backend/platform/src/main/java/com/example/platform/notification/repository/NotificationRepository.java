package com.example.platform.notification.repository;

import com.example.platform.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Get all notifications for a specific user, newest first
    List<Notification> findByRecipientEmailOrderBySentAtDesc(String email);
    
    // Count unread notifications (for the red badge number)
    long countByRecipientEmailAndIsReadFalse(String email);
}