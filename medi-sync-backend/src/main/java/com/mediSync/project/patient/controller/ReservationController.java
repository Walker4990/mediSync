package com.mediSync.project.patient.controller;

import com.mediSync.project.insurance.service.ClaimOrchestrator;
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
    private final ClaimOrchestrator claimOrchestrator;
    //해당 날짜에 잡힌 예약 시간 리스트 가져오기
    @GetMapping("/getReservationList")
    public List<String> getReservationList(@RequestParam String date, @RequestParam Integer admin_id) {
        System.out.println("날짜 : "+ date + "admin Id : "+admin_id);

        Reservation reservation = new Reservation();
        //시간 설정
        LocalDate localDate = LocalDate.parse(date);
        LocalDateTime localDateTime = localDate.atStartOfDay();
        Date convertDate = Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());

        reservation.setReservationDate(convertDate);
        reservation.setAdminId(admin_id);
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

        // ✅ 상태가 DONE으로 변경되면 보험 청구 자동 실행
        if ("DONE".equalsIgnoreCase(status)) {
            try {
                // 예약과 연결된 진료기록 ID 조회
                Long recordId = reservationService.findRecordIdByReservationId(reservationId);

                if (recordId != null) {
                    // 보험 자동 청구 실행
                    claimOrchestrator.run(recordId);
                    System.out.println("✅ [자동청구] recordId=" + recordId + " → 보험 청구 완료");
                } else {
                    System.out.println("⚠️ [자동청구] 연결된 recordId 없음 - reservationId=" + reservationId);
                }

            } catch (Exception e) {
                System.err.println("❌ [자동청구 오류] " + e.getMessage());
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", result > 0,
                "status", status
        ));
    }







}
