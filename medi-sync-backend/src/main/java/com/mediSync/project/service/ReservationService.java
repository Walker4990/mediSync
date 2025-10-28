package com.mediSync.project.service;

import com.mediSync.project.mapper.ReservationMapper;
import com.mediSync.project.vo.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationMapper reservationMapper;

    //로그인 중인 회원 정보 가져오기
    
    
    // 의사 정보 가져오기

    
    //해당 날짜의 예약 정보 가져오기
    public List<String> getReservedTimesByDate(Reservation reservation){
        return reservationMapper.getReservedTimesByDate(reservation);
    }

    //예약 추가하기
    public int addReservation(Reservation reservation){
        return reservationMapper.addReservation(reservation);
    }

    //예약 취소하기
    public int deleteReservation(Reservation reservation){return  reservationMapper.deleteReservation(reservation);}

    // 예약 상태 변경
    public int updateStatus(Long patientId, String status){
        return reservationMapper.updateStatus(patientId, status);
    }
}
