package com.mediSync.project.room.controller;

import com.mediSync.project.room.service.RoomService;
import com.mediSync.project.room.vo.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/list")
    public ResponseEntity<List<Room>> selectAllRooms() {
        return ResponseEntity.ok(roomService.selectAllRooms());
    }
}
