package com.mediSync.project.mapper;

import com.mediSync.project.vo.Reservation;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ReservationMapper {

    //해당 날짜에 예약된 시간 리스트 가져오기
    List<String> getReservedTimesByDate(Reservation reservation);
    
    //예약 하기
    int addReservation(Reservation reservation);

    //예약 취소하기
    int deleteReservation(Reservation reservation);

}
