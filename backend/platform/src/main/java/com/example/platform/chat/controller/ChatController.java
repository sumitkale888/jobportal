package com.example.platform.chat.controller;

import com.example.platform.chat.model.Message;
import com.example.platform.chat.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {
    private final ChatService chatService;

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody SendRequest request, Principal principal) {
        Message message = chatService.sendMessage(principal.getName(), request.getRecipientEmail(), request.getContent(), request.getApplicationId());
        return ResponseEntity.ok(message);
    }

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(@RequestParam String contactEmail, Principal principal) {
        return ResponseEntity.ok(chatService.getConversation(principal.getName(), contactEmail));
    }

    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    @GetMapping("/my-messages")
    public ResponseEntity<List<Message>> getMyMessages(Principal principal) {
        return ResponseEntity.ok(chatService.getMyMessages(principal.getName()));
    }

    @Data
    private static class SendRequest {
        private String recipientEmail;
        private String content;
        private Long applicationId;
    }
}
