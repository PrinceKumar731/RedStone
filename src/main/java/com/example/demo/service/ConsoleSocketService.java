package com.example.demo.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class ConsoleSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public ConsoleSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendLog(String log) {
        messagingTemplate.convertAndSend("/topic/console", log);
    }
}