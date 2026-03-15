package com.example.platform.chat.repository;

import com.example.platform.chat.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllBySenderIdOrRecipientIdOrderBySentAtAsc(Long senderId, Long recipientId);
    List<Message> findAllBySenderIdAndRecipientIdOrderBySentAtAsc(Long senderId, Long recipientId);
}
