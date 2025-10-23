package com.mediSync.project.mapper;

import com.mediSync.project.vo.Reservation;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ReservationMapper {
    
    //병원 의사 정보 가져오기
    
    
    //해당 날짜에 예약된 시간 리스트 가져오기
    List<String> getReservedTimesByDate(String date);
    
    //예약 하가
    int addReservation(Reservation reservation);

}
