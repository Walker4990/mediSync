package com.mediSync.project.common.service;

import com.mediSync.project.common.dto.CalendarDTO;
import com.mediSync.project.common.mapper.CalendarMapper;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.patient.vo.Reservation;
import com.mediSync.project.test.vo.TestReservation;
import com.mediSync.project.test.vo.TestSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private  final CalendarMapper calendarMapper;
    public List<CalendarDTO> getUserCalendar(Integer patient_id){
       return calendarMapper.getUserCalendar(patient_id);
    }

    //유저의 예약정보 가져오기
    @Transactional
    public List<CalendarDTO> viewAllReservation(Long patient_id){
        List<CalendarDTO> calendarInfo = new ArrayList<>();
        List<CalendarDTO> reserList = calendarMapper.getReservation(patient_id);

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
        List<TestReservation> tereList = calendarMapper.getTestReservation(patient_id);
        if(tereList != null && !tereList.isEmpty()){
            for(TestReservation tere: tereList){
                List<CalendarDTO> scheList = calendarMapper.getTestSchedule(tere.getScheduleId());
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
        List<CalendarDTO> operList = calendarMapper.getOperation(patient_id);
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

    //모든 예약정보 가져오기
    @Transactional
    public List<CalendarDTO> viewAllReservationAll(){
        List<CalendarDTO> calendarInfo = new ArrayList<>();
        List<CalendarDTO> reserList = calendarMapper.getReservationAll();

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

         List<CalendarDTO> scheList = calendarMapper.getTestScheduleAll();
         if (scheList != null && !scheList.isEmpty()){
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


        //수술 예약
        List<CalendarDTO> operList = calendarMapper.getOperationAll();
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









    //예약 정보 삭제하기
    @Transactional
    public void cancelReservation(Long id, String type, LocalDateTime startDate){
        LocalDate date;
        String time;

            switch (type){
                case "진료 예약":
                    calendarMapper.cancelReservation(Map.of("id",id,"date",startDate));
                    break;
                case "검사 예약":
                    date = startDate.toLocalDate();
                    time = String.format("%02d:%02d",startDate.getHour(),startDate.getMinute());
                    calendarMapper.cancelTestReservation(Map.of("id",id,"date",date,"time",time));
                    break;
                case "수술 예약":
                    date = startDate.toLocalDate();
                    time = String.format("%02d:%02d",startDate.getHour(),startDate.getMinute());
                    calendarMapper.cancelOperation(Map.of("id",id));
                    break;
                default:throw new IllegalArgumentException("알 수 없는 예약 유형: " + type);

            }

    }






}
