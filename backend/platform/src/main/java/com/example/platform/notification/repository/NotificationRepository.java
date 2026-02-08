package com.example.platform.notification.repository;

import com.example.platform.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientEmailOrderBySentAtDesc(String email);
    

    long countByRecipientEmailAndIsReadFalse(String email);
}