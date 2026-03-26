package com.example.platform.chat.service;

import com.example.platform.auth.model.User;
import com.example.platform.auth.repository.UserRepository;
import com.example.platform.chat.model.DeletedConversation;
import com.example.platform.chat.repository.DeletedConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeletedConversationService {
    private final DeletedConversationRepository deletedConversationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void markConversationDeleted(Long userId, Long contactId) {
        if (!deletedConversationRepository.existsByUserIdAndContactId(userId, contactId)) {
            User user = userRepository.findById(userId).orElseThrow();
            User contact = userRepository.findById(contactId).orElseThrow();
            DeletedConversation dc = DeletedConversation.builder().user(user).contact(contact).build();
            deletedConversationRepository.save(dc);
        }
    }

    @Transactional
    public void undoDelete(Long userId, Long contactId) {
        deletedConversationRepository.deleteByUserIdAndContactId(userId, contactId);
    }
}
