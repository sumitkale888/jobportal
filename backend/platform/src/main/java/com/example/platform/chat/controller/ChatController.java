package com.example.platform.chat.controller;

import com.example.platform.application.model.Application;
import com.example.platform.application.repository.ApplicationRepository;
import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.chat.dto.MessageDto;
import com.example.platform.chat.model.Message;
import com.example.platform.chat.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class ChatController {
    private final ChatService chatService;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @PostMapping("/send")
    public ResponseEntity<MessageDto> sendMessage(@RequestBody SendRequest request, Principal principal) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("📨 REST /chat/send ENDPOINT CALLED");
        System.out.println("=".repeat(60));
        System.out.println("Sender email (from JWT): " + principal.getName());
        System.out.println("RecipientId (from request): " + request.getRecipientId());
        System.out.println("Content: " + request.getContent());
        System.out.println("ApplicationId: " + request.getApplicationId());
        
        User sender = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sender not found"));
        System.out.println("Sender ID: " + sender.getId());
        
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content cannot be empty");
        }

        Long resolvedRecipientId = resolveRecipientId(sender, request);

        User recipient = userRepository.findById(resolvedRecipientId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));
        System.out.println("Recipient ID: " + recipient.getId());

        Message message = chatService.sendMessage(sender.getId(), recipient.getId(), request.getContent(), request.getApplicationId());
        MessageDto dto = toDto(message);
        
        System.out.println("✅ Message saved to DB with ID: " + message.getId());
        System.out.println("Broadcasting to topic: /topic/chat/" + recipient.getId());

        // broadcast message to both sender and recipient topics
        messagingTemplate.convertAndSend("/topic/chat/" + recipient.getId(), dto);
        System.out.println("✅ Broadcast sent to recipient topic");
        
        messagingTemplate.convertAndSend("/topic/chat/" + sender.getId(), dto);
        System.out.println("✅ Broadcast sent to sender topic");
        System.out.println("=".repeat(60) + "\n");

        return ResponseEntity.ok(dto);
    }

    private Long resolveRecipientId(User sender, SendRequest request) {
        if (request.getApplicationId() != null) {
            Application application = applicationRepository.findByIdWithChatParticipants(request.getApplicationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

            Long recruiterUserId = application.getJob().getPostedBy().getId();
            Long studentUserId = application.getStudent().getUser().getId();

            if (!sender.getId().equals(recruiterUserId) && !sender.getId().equals(studentUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized chat for this application");
            }

            return sender.getId().equals(recruiterUserId) ? studentUserId : recruiterUserId;
        }

        if (request.getRecipientId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Recipient ID is required");
        }

        return request.getRecipientId();
    }

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @PostMapping("/mark-as-read")
    public ResponseEntity<Void> markAsRead(@RequestBody MarkReadRequest request, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        chatService.markMessagesAsRead(request.getSenderId(), user.getId());
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @GetMapping("/me")
    public ResponseEntity<UserInfoDto> getCurrentUser(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return ResponseEntity.ok(new UserInfoDto(user.getId(), user.getEmail()));
    }

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @GetMapping("/conversation")
    public ResponseEntity<List<MessageDto>> getConversation(@RequestParam Long contactId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        List<MessageDto> messages = chatService.getConversation(user.getId(), contactId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @GetMapping("/my-messages")
    public ResponseEntity<List<MessageDto>> getMyMessages(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

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
        dto.setIsRead(msg.getIsRead());
        dto.setReadAt(msg.getReadAt());
        return dto;
    }

    @Data
    private static class SendRequest {
        private Long recipientId;
        private String content;
        private Long applicationId;
    }

    @Data
    private static class MarkReadRequest {
        private Long senderId;
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
