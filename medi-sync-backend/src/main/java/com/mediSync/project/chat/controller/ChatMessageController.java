package com.mediSync.project.chat.controller;

import com.mediSync.project.chat.service.ChatMessageService;
import com.mediSync.project.chat.vo.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public void sendMessage(@DestinationVariable Long senderId, @DestinationVariable Long receiverId, ChatMessage chatMessage){
        chatMessage.setSenderId(senderId);
        chatMessage.setReceiverId(receiverId);
        chatMessage.setSentAt(LocalDateTime.now());
        if (chatMessage.getSenderType() == null) chatMessage.setSenderType("USER");
        if (chatMessage.getReceiverType() == null) chatMessage.setReceiverType("ADMIN");
        System.out.println("📩 [WebSocket] 메시지 수신: " + chatMessage);
        chatMessageService.insertMessage(chatMessage);
        messagingTemplate.convertAndSend("/topic/chat/" + receiverId, chatMessage);
        }
}
