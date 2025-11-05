package com.mediSync.project.chat.mapper;

import com.mediSync.project.chat.vo.ChatMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChatMessageMapper {
    int insertMessage(ChatMessage chatMessage);
    List<ChatMessage> getMessagesBetween(@Param("receiverId") Long receiverId, @Param("senderId") Long senderId);
}
