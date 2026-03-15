package com.example.platform.chat.controller;

import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.chat.model.Message;
import com.example.platform.chat.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {
    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @PostMapping("/send")
    public ResponseEntity<MessageDto> sendMessage(@RequestBody SendRequest request, Principal principal) {
        User sender = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        Message message = chatService.sendMessage(sender.getId(), recipient.getId(), request.getContent(), request.getApplicationId());
        MessageDto dto = toDto(message);

        // broadcast message to both sender and recipient topics
        messagingTemplate.convertAndSend("/topic/chat/" + recipient.getId(), dto);
        messagingTemplate.convertAndSend("/topic/chat/" + sender.getId(), dto);

        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @GetMapping("/me")
    public ResponseEntity<UserInfoDto> getCurrentUser(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new UserInfoDto(user.getId(), user.getEmail()));
    }

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @GetMapping("/conversation")
    public ResponseEntity<List<MessageDto>> getConversation(@RequestParam Long contactId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MessageDto> messages = chatService.getConversation(user.getId(), contactId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @GetMapping("/my-messages")
    public ResponseEntity<List<MessageDto>> getMyMessages(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MessageDto> messages = chatService.getMyMessages(user.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(messages);
    }

    private MessageDto toDto(Message msg) {
        MessageDto dto = new MessageDto();
        dto.setId(msg.getId());
        dto.setSenderId(msg.getSenderId());
        dto.setRecipientId(msg.getRecipientId());
        dto.setSenderEmail(userRepository.findById(msg.getSenderId()).map(User::getEmail).orElse("Unknown"));
        dto.setRecipientEmail(userRepository.findById(msg.getRecipientId()).map(User::getEmail).orElse("Unknown"));
        dto.setContent(msg.getContent());
        dto.setSentAt(msg.getSentAt());
        dto.setApplicationId(msg.getApplicationId());
        return dto;
    }

    @Data
    private static class SendRequest {
        private Long recipientId;
        private String content;
        private Long applicationId;
    }

    @Data
    private static class MessageDto {
        private Long id;
        private Long senderId;
        private Long recipientId;
        private String senderEmail;
        private String recipientEmail;
        private String content;
        private java.time.LocalDateTime sentAt;
        private Long applicationId;
    }

    @Data
    private static class UserInfoDto {
        private Long id;
        private String email;

        public UserInfoDto(Long id, String email) {
            this.id = id;
            this.email = email;
        }
    }
}
