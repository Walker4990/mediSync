package com.mediSync.project.chat.service;

import com.mediSync.project.chat.mapper.ChatMessageMapper;
import com.mediSync.project.chat.vo.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageMapper chatMessageMapper;

    public int insertMessage(ChatMessage chatMessage){
        return  chatMessageMapper.insertMessage(chatMessage);
    }

    public List<ChatMessage> getMessagesBetween(Long LeceiverId, Long senderId){
        return chatMessageMapper.getMessagesBetween(LeceiverId, senderId);
    }
}
