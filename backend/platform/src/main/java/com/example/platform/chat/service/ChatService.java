package com.example.platform.chat.service;

import com.example.platform.chat.model.Message;
import com.example.platform.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final MessageRepository messageRepository;

    @Transactional
    public Message sendMessage(String senderEmail, String recipientEmail, String content, Long applicationId) {
        Message message = Message.builder()
                .senderEmail(senderEmail)
                .recipientEmail(recipientEmail)
                .content(content)
                .sentAt(LocalDateTime.now())
                .applicationId(applicationId)
                .build();
        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<Message> getConversation(String userEmail, String contactEmail) {
        List<Message> fromTo = messageRepository.findAllBySenderEmailAndRecipientEmailOrderBySentAtAsc(userEmail, contactEmail);
        List<Message> toFrom = messageRepository.findAllBySenderEmailAndRecipientEmailOrderBySentAtAsc(contactEmail, userEmail);
        fromTo.addAll(toFrom);
        fromTo.sort((a, b) -> a.getSentAt().compareTo(b.getSentAt()));
        return fromTo;
    }

    @Transactional(readOnly = true)
    public List<Message> getMyMessages(String userEmail) {
        return messageRepository.findAllBySenderEmailOrRecipientEmailOrderBySentAtAsc(userEmail, userEmail);
    }
}