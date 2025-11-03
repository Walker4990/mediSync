package com.mediSync.project.room.service;

import com.mediSync.project.room.mapper.RoomMapper;
import com.mediSync.project.room.vo.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomMapper roomMapper;

    public List<Room> selectAllRooms() {
        return roomMapper.selectAllRooms();
    }

}
