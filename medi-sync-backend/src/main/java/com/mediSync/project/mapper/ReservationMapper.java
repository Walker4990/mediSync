package com.mediSync.project.mapper;

import com.mediSync.project.vo.Reservation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ReservationMapper {

    //해당 날짜에 예약된 시간 리스트 가져오기
    List<String> getReservedTimesByDate(Reservation reservation);
    
    //예약 하기
    int addReservation(Reservation reservation);

    //예약 취소하기
    int deleteReservation(Reservation reservation);

    //내 예약 조회하기
    List<Reservation> selectReservationByPatientId(Integer patient_id);

    //오늘 예약 조회하기
    List<Reservation> findReservationBetween(@Param("start")LocalDate start,
                                             @Param("end")LocalDate end);
    // 처방시 상태변경
    int updateStatus(Long patientId, String status);
}
