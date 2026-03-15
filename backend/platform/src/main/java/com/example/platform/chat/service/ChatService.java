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
    public Message sendMessage(Long senderId, Long recipientId, String content, Long applicationId) {
        Message message = Message.builder()
                .senderId(senderId)
                .recipientId(recipientId)
                .content(content)
                .sentAt(LocalDateTime.now())
                .applicationId(applicationId)
                .build();
        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<Message> getConversation(Long userId, Long contactId) {
        List<Message> fromTo = messageRepository.findAllBySenderIdAndRecipientIdOrderBySentAtAsc(userId, contactId);
        List<Message> toFrom = messageRepository.findAllBySenderIdAndRecipientIdOrderBySentAtAsc(contactId, userId);
        fromTo.addAll(toFrom);
        fromTo.sort((a, b) -> a.getSentAt().compareTo(b.getSentAt()));
        return fromTo;
    }

    @Transactional(readOnly = true)
    public List<Message> getMyMessages(Long userId) {
        return messageRepository.findAllBySenderIdOrRecipientIdOrderBySentAtAsc(userId, userId);
    }
}