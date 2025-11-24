package com.mediSync.project.chat.service;

import com.mediSync.project.chat.mapper.ChatMessageMapper;
import com.mediSync.project.chat.vo.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageMapper chatMessageMapper;
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int insertMessage(ChatMessage chatMessage){

        chatMessage.setReadStatus(false);
        return  chatMessageMapper.insertMessage(chatMessage);
    }

    public List<ChatMessage> getMessagesBetween(Long receiverId, Long senderId){
        return chatMessageMapper.getMessagesBetween(receiverId, senderId);
    }

    public int getUnreadCount(Long senderId, Long receiverId) {
        return chatMessageMapper.getUnreadCount(senderId, receiverId);
    }

    @Transactional
    public void markMessagesAsRead(Long senderId, Long receiverId) {
        chatMessageMapper.markMessagesAsRead(senderId, receiverId);
    }
    public List<ChatMessage> getChatPartners(Long adminId) {
        return chatMessageMapper.findChatPartners(adminId);
    }
}
