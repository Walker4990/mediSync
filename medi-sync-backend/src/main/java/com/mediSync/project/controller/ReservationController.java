package com.mediSync.project.controller;

import com.mediSync.project.service.ReservationService;
import com.mediSync.project.vo.Doctor;
import com.mediSync.project.vo.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservation")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    //현재 로그인중인 회원 정보 가져오기(페이지 이동시 바로 실행)
    

    
    //해당 날짜에 잡힌 예약 날짜 가져오기
    @GetMapping("/getReservationList")
    public List<String> getReservationList(@RequestParam String date) {

        List<String> rawTimes = reservationService.getReservedTimesByDate(date);

        return rawTimes.stream()
                .map(time -> time.substring(0, 5)) // "13:00"
                .collect(Collectors.toList());
    }

    //병원 예약 하기
    @PostMapping("/addReservation")
    public int addReservation(@RequestBody Reservation reservation){
        System.out.println("📥 받은 예약 데이터: " + reservation);
        int res = reservationService.addReservation(reservation);
        return res;
    }



}
