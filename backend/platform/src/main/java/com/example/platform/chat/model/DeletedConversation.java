package com.example.platform.chat.model;

import com.example.platform.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "deleted_conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeletedConversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", nullable = false)
    private User contact;
}
