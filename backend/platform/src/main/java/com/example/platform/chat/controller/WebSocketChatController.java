package com.example.platform.chat.controller;

import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.chat.dto.MessageDto;
import com.example.platform.chat.model.Message;
import com.example.platform.chat.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class WebSocketChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/send")
    public void sendMessage(ChatMessageRequest request) {
        System.out.println("\n" + "=".repeat(50));
        System.out.println("🎯 [STOMP HANDLER] RECEIVED MESSAGE");
        System.out.println("=".repeat(50));
        System.out.println("   senderId: " + request.getSenderId());
        System.out.println("   recipientId: " + request.getRecipientId());
        System.out.println("   content: " + request.getContent());
        System.out.println("   applicationId: " + request.getApplicationId());
        
        // Validate request
        if (request.getSenderId() == null || request.getRecipientId() == null) {
            System.err.println("❌ [STOMP HANDLER] Invalid request - missing senderId or recipientId");
            return;
        }
        
        try {
            // Save message to database
            Message message = chatService.sendMessage(
                    request.getSenderId(),
                    request.getRecipientId(),
                    request.getContent(),
                    request.getApplicationId()
            );
            
            System.out.println("✅ [STOMP HANDLER] Message saved to DB");
            System.out.println("   Message ID: " + message.getId());
            System.out.println("   sentAt: " + message.getSentAt());
            
            // Convert to DTO
            MessageDto messageDto = convertToDto(message);
            System.out.println("✅ [STOMP HANDLER] Message DTO created");
            
            // Send to recipient
            String recipientTopic = "/topic/chat/" + request.getRecipientId();
            System.out.println("📤 [STOMP HANDLER] Broadcasting to recipient: " + recipientTopic);
            messagingTemplate.convertAndSend(recipientTopic, messageDto);
            System.out.println("✅ [STOMP HANDLER] Sent to recipient");
            
            // Send to sender
            String senderTopic = "/topic/chat/" + request.getSenderId();
            System.out.println("📤 [STOMP HANDLER] Broadcasting to sender: " + senderTopic);
            messagingTemplate.convertAndSend(senderTopic, messageDto);
            System.out.println("✅ [STOMP HANDLER] Sent to sender");
            
            System.out.println("=".repeat(50) + "\n");
            
        } catch (Exception e) {
            System.err.println("❌ [STOMP HANDLER] Error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=".repeat(50) + "\n");
        }
    }

    private @NonNull MessageDto convertToDto(Message msg) {
        MessageDto dto = new MessageDto();
        dto.setId(msg.getId());
        dto.setSenderId(msg.getSenderId());
        dto.setRecipientId(msg.getRecipientId());
        
        Long senderId = msg.getSenderId();
        if (senderId != null) {
            dto.setSenderEmail(userRepository.findById(senderId).map(User::getEmail).orElse("Unknown"));
        } else {
            dto.setSenderEmail("Unknown");
        }
        
        Long recipientId = msg.getRecipientId();
        if (recipientId != null) {
            dto.setRecipientEmail(userRepository.findById(recipientId).map(User::getEmail).orElse("Unknown"));
        } else {
            dto.setRecipientEmail("Unknown");
        }
        
        dto.setContent(msg.getContent());
        dto.setSentAt(msg.getSentAt());
        dto.setApplicationId(msg.getApplicationId());
        dto.setIsRead(msg.getIsRead());
        dto.setReadAt(msg.getReadAt());
        return dto;
    }

    @Data
    public static class ChatMessageRequest {
        private Long senderId;
        private Long recipientId;
        private String content;
        private Long applicationId;
    }
}

