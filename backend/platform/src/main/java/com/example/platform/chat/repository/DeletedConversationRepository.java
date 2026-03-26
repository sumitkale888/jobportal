package com.example.platform.chat.repository;

import com.example.platform.chat.model.DeletedConversation;
import com.example.platform.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DeletedConversationRepository extends JpaRepository<DeletedConversation, Long> {
    Optional<DeletedConversation> findByUserIdAndContactId(Long userId, Long contactId);
    void deleteByUserIdAndContactId(Long userId, Long contactId);
    boolean existsByUserIdAndContactId(Long userId, Long contactId);
}
