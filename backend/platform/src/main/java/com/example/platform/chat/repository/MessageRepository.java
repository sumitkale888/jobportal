package com.example.platform.chat.repository;

import com.example.platform.chat.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllBySenderEmailOrRecipientEmailOrderBySentAtAsc(String senderEmail, String recipientEmail);
    List<Message> findAllBySenderEmailAndRecipientEmailOrderBySentAtAsc(String senderEmail, String recipientEmail);
    List<Message> findAllByRecipientEmailAndSenderEmailOrderBySentAtAsc(String recipientEmail, String senderEmail);
}
