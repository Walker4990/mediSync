package com.mediSync.project.chat.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("chat")
public class ChatMessage {
    private Long messageId;
    private Long senderId;
    private String senderType;
    private Long receiverId;
    private String receiverType;
    private String content;
    private LocalDateTime sentAt;
    private boolean readStatus;
    private String chatType;
}
