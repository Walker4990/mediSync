package com.mediSync.project.patient.controller;

import com.mediSync.project.patient.service.ReservationService;
import com.mediSync.project.patient.vo.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservation")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    //해당 날짜에 잡힌 예약 시간 리스트 가져오기
    @GetMapping("/getReservationList")
    public List<String> getReservationList(@RequestParam String date, @RequestParam Integer doctor_id) {
        System.out.println(date + doctor_id);
        Reservation reservation = new Reservation();
        //시간 설정
        LocalDate localDate = LocalDate.parse(date);
        LocalDateTime localDateTime = localDate.atStartOfDay();
        Date convertDate = Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());

        reservation.setReservationDate(convertDate);
        reservation.setAdminId(doctor_id);
        List<String> rawTimes = reservationService.getReservedTimesByDate(reservation);

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

    //병원 예약 취소하기
    @DeleteMapping("/deleteReservation")
    public int deleteReservation(@RequestBody Reservation reservation){
        System.out.println("넘어온 삭제 정보 : "+ reservation);
        int res = reservationService.deleteReservation(reservation);
        return res;
    }

    //내 예약 조회하기
    @GetMapping("/viewReservation")
    public List<Reservation> viewMyReservation(@RequestParam Integer patient_id){
        List<Reservation> list = reservationService.selectReservationByPatientId(patient_id);
        return  list;
    }

    //상태 업데이트
    @PutMapping("/{reservationId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long reservationId,
            @RequestParam String status) {

        int result = reservationService.updateStatus(reservationId, status);
        return ResponseEntity.ok(Map.of(
                "success", result > 0,
                "status", status
        ));
    }

}
