package com.mediSync.project.controller;

import com.mediSync.project.dto.CalendarDTO;
import com.mediSync.project.service.CalendarService;
import com.mediSync.project.vo.Operation;
import com.mediSync.project.vo.Reservation;
import com.mediSync.project.vo.TestReservation;
import com.mediSync.project.vo.TestSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public List<CalendarDTO> getUserCalendar(
                                @RequestParam("patient_id") Integer patient_id){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        List<CalendarDTO> calendarInfo = new ArrayList<>();
        List<Reservation> reserList = calendarService.getReservation(patient_id);

        // 진료예약
        if(reserList != null && !reserList.isEmpty()){

            for(Reservation re : reserList){
                CalendarDTO dto = new CalendarDTO();
                dto.setTitle("병원 진료");
                String date = sdf.format(re.getReservationDate());
                dto.setStartDate(date);
                dto.setColor("#3B82F6");
                dto.setTextColor("white");
                calendarInfo.add(dto);
                System.out.println("reservation : "+dto);
            }
        }
        // 검사 예약
        List<TestReservation> tereList = calendarService.getTestReservation(patient_id);
        if(tereList != null && !tereList.isEmpty()){
            for(TestReservation tere: tereList){
                List<TestSchedule> scheList = calendarService.getTestSchedule(tere.getScheduleId());
                if (scheList == null || scheList.isEmpty()) continue;
                for(TestSchedule sche : scheList){
                    CalendarDTO dto = new CalendarDTO();
                    dto.setTitle(sche.getTestName());
                    String date = sche.getTestDate().toString();
                    date +="T"+sche.getTestTime().toString();
                    dto.setStartDate(date);
                    dto.setColor("#60A5FA");
                    dto.setTextColor("#FFFFFF");
                    calendarInfo.add(dto);
                    System.out.println("schedule : "+dto);
                }
            }
        }
        //수술 예약
        List<Operation> operList = calendarService.getOperation(patient_id);
        if(operList != null && !operList.isEmpty()){
            for(Operation op: operList){
                CalendarDTO dto = new CalendarDTO();
                dto.setTitle(op.getOperationName());
                String date = op.getScheduledDate().toString();
                date +="T"+op.getScheduledTime().toString();
                dto.setStartDate(date);
                dto.setColor("#1E40AF");
                dto.setTextColor("#FFFFFF");
                calendarInfo.add(dto);
                System.out.println("operation : "+dto);
            }

        }
        return calendarInfo;
    }
}
