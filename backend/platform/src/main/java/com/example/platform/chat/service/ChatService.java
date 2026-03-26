package com.example.platform.chat.service;

import com.example.platform.chat.model.Message;
import com.example.platform.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final MessageRepository messageRepository;
    private final EntityManager entityManager;

    @Transactional
    public Message sendMessage(Long senderId, Long recipientId, String content, Long applicationId) {
        Message message = Message.builder()
                .senderId(senderId)
                .recipientId(recipientId)
                .content(content)
                .sentAt(LocalDateTime.now())
                .applicationId(applicationId)
                .isRead(false)
                .build();
        Message saved = messageRepository.save(message);
        entityManager.flush(); // Force immediate database write
        System.out.println("✅ Message saved and flushed to DB: ID=" + saved.getId() + ", from=" + senderId + ", to=" + recipientId);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Message> getConversation(Long userId, Long contactId) {
        List<Message> fromTo = messageRepository.findAllBySenderIdAndRecipientIdOrderBySentAtAsc(userId, contactId);
        List<Message> toFrom = messageRepository.findAllBySenderIdAndRecipientIdOrderBySentAtAsc(contactId, userId);
        fromTo.addAll(toFrom);
        fromTo.sort((a, b) -> a.getSentAt().compareTo(b.getSentAt()));
        System.out.println("✅ getConversation between " + userId + " and " + contactId + ": " + fromTo.size() + " messages");
        return fromTo;
    }

    @Transactional(readOnly = true)
    public List<Message> getMyMessages(Long userId) {
        List<Message> messages = messageRepository.findAllBySenderIdOrRecipientIdOrderBySentAtAsc(userId, userId);
        System.out.println("✅ getMyMessages for user " + userId + ": " + messages.size() + " messages");
        messages.forEach(m -> System.out.println("   - From " + m.getSenderId() + " to " + m.getRecipientId() + ": " + m.getContent().substring(0, Math.min(30, m.getContent().length()))));
        return messages;
    }

    @Transactional
    public void markMessagesAsRead(Long senderId, Long recipientId) {
        List<Message> unreadMessages = messageRepository.findAllBySenderIdAndRecipientIdAndIsReadFalse(senderId, recipientId);
        LocalDateTime now = LocalDateTime.now();
        for (Message msg : unreadMessages) {
            msg.setIsRead(true);
            msg.setReadAt(now);
        }
        messageRepository.saveAll(unreadMessages);
    }
}