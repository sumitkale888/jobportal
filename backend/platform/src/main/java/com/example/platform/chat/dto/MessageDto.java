package com.example.platform.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDto {
    private Long id;
    private Long senderId;
    private Long recipientId;
    private String senderEmail;
    private String recipientEmail;
    private String content;
    private LocalDateTime sentAt;
    private Long applicationId;
    private Boolean isRead;
    private LocalDateTime readAt;
}
