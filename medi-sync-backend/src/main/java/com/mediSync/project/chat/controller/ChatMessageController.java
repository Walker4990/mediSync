package com.mediSync.project.chat.controller;

import com.mediSync.project.chat.service.ChatMessageService;
import com.mediSync.project.chat.vo.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/{senderId}/{receiverId}")
    public List<ChatMessage> getMessages(@PathVariable Long senderId, @PathVariable Long receiverId){
        return chatMessageService.getMessagesBetween(senderId, receiverId);
    }
    @MessageMapping("/chat/{senderId}/{receiverId}")
    public void sendMessage(@DestinationVariable Long senderId,
                            @DestinationVariable Long receiverId,
                            ChatMessage chatMessage) {

        chatMessage.setSenderId(senderId);
        chatMessage.setReceiverId(receiverId);
        chatMessage.setSentAt(LocalDateTime.now());

        // ✅ 발신자 타입 자동 지정
        if (senderId == 2L) { // 관리자면
            chatMessage.setSenderType("ADMIN");
            chatMessage.setReceiverType("USER");
        } else { // 일반 사용자면
            chatMessage.setSenderType("USER");
            chatMessage.setReceiverType("ADMIN");
        }

        System.out.println("📩 [WebSocket] 메시지 수신: " + chatMessage);

        chatMessageService.insertMessage(chatMessage);
        messagingTemplate.convertAndSend("/topic/chat/" + receiverId, chatMessage);
        messagingTemplate.convertAndSend("/topic/chat/admin", chatMessage);
    }

    @GetMapping("/unread/{senderId}/{receiverId}")
    public int getUnreadCount(@PathVariable Long senderId, @PathVariable Long receiverId) {
        return chatMessageService.getUnreadCount(senderId, receiverId);
    }

    @PostMapping("/read/{senderId}/{receiverId}")
    public void markMessagesAsRead(@PathVariable Long senderId, @PathVariable Long receiverId) {
        chatMessageService.markMessagesAsRead(senderId, receiverId);
    }
}
