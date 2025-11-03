package com.mediSync.project.room.mapper;

import com.mediSync.project.room.vo.Room;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface RoomMapper {
    List<Room> findAvailableRooms(String department);
    int incrementRoomCount(Long roomId);
    List<Room> selectAllRooms();

}
