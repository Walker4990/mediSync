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

    @GetMapping
    public List<CalendarDTO> getUserCalendar(
                                @RequestParam("patient_id") Long patient_id){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        List<CalendarDTO> calendarInfo = new ArrayList<>();
        List<CalendarDTO> reserList = calendarService.getReservation(patient_id);

        // 진료예약
        if(reserList != null && !reserList.isEmpty()){

            for(CalendarDTO re : reserList){
                System.out.println("가져온 값 : "+ re);
                re.setTitle("병원 진료");
                re.setColor("#3B82F6");
                re.setTextColor("white");
                re.setType("진료 예약");
                calendarInfo.add(re);
                System.out.println("최종 reservation : "+ re);
            }
        }
        // 검사 예약
        List<TestReservation> tereList = calendarService.getTestReservation(patient_id);
        if(tereList != null && !tereList.isEmpty()){
            for(TestReservation tere: tereList){
                List<CalendarDTO> scheList = calendarService.getTestSchedule(tere.getScheduleId());
                if (scheList == null || scheList.isEmpty()) continue;
                for(CalendarDTO sche : scheList){
                    System.out.println("가져온 값 : "+ sche);
                    sche.setTitle(sche.getTitle());
                    sche.setColor("#60A5FA");
                    sche.setTextColor("#FFFFFF");
                    sche.setType("검사 예약");
                    calendarInfo.add(sche);
                    System.out.println("schedule : "+sche);
                }
            }
        }
        //수술 예약
        List<CalendarDTO> operList = calendarService.getOperation(patient_id);
        if(operList != null && !operList.isEmpty()){
            for(CalendarDTO op: operList){
                System.out.println("가져온 값 : "+ op);
                op.setColor("#1E40AF");
                op.setTextColor("#FFFFFF");
                op.setType("수술 예약");
                calendarInfo.add(op);
                System.out.println("operation : "+op);
            }

        }
        return calendarInfo;
    }

    @DeleteMapping
    public ResponseEntity<?> deleteReservation(@RequestParam("id") Long id,
                                               @RequestParam("type") String type,
                                               @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                               LocalDateTime startDate){

        calendarService.cancelReservation(id,type,startDate);
        return ResponseEntity.ok("예약 취소 완료");
    }
}
