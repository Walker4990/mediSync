package com.mediSync.project.common.controller;

import com.mediSync.project.common.dto.CalendarDTO;
import com.mediSync.project.common.service.CalendarService;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.patient.vo.Reservation;
import com.mediSync.project.test.vo.TestReservation;
import com.mediSync.project.test.vo.TestSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    //회원의 예약 정보 가져오기
    @GetMapping
    public List<CalendarDTO> getUserCalendar(
                                @RequestParam("patient_id") Long patient_id){

       List<CalendarDTO> calendarInfo = calendarService.viewAllReservation(patient_id);
        return calendarInfo;
    }

    @GetMapping("/all")
    public List<CalendarDTO> getScheduleAll(){
        List<CalendarDTO> calenderInfo = calendarService.viewAllReservationAll();

        System.out.println("전체 일정 리스트 : " + calenderInfo);
        return calenderInfo;
    }

    //회원의 예약정보 업데이트하기
    @PutMapping
    public ResponseEntity<?> deleteReservation(@RequestParam("id") Long id,
                                               @RequestParam("type") String type,
                                               @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                               LocalDateTime startDate){

        calendarService.cancelReservation(id,type,startDate);
        return ResponseEntity.ok("예약 취소 완료");
    }
}
