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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private  final CalendarMapper calendarMapper;
    public List<CalendarDTO> getUserCalendar(Integer patient_id){
       return calendarMapper.getUserCalendar(patient_id);
    }
    //진료예약 정보 가져오기
    public List<CalendarDTO> getReservation(Long patient_id){
        return  calendarMapper.getReservation(patient_id);
    }
    //검사 정보 가져오기
    public List<TestReservation> getTestReservation(Long patient_id){
        return calendarMapper.getTestReservation(patient_id);
    }
    //검사 이름 및 날짜&시간 가져오기
    public List<CalendarDTO> getTestSchedule(Long schedule_id){
        return calendarMapper.getTestSchedule(schedule_id);
    }

    //수술 예약 정보 가져오기
    public List<CalendarDTO> getOperation(Long patient_id){
        return calendarMapper.getOperation(patient_id);
    }

    @Transactional
    public void cancelReservation(Long id, String type, LocalDateTime startDate){
        LocalDate date;
        String time;

            switch (type){
                case "진료 예약":
                    calendarMapper.deleteReservation(Map.of("id",id,"date",startDate));
                    break;
                case "검사 예약":
                    date = startDate.toLocalDate();
                    time = String.format("%02d:%02d",startDate.getHour(),startDate.getMinute());
                    calendarMapper.deleteTestSchedule(Map.of("id",id,"date",date,"time",time));
                    break;
                case "수술 예약":
                    date = startDate.toLocalDate();
                    time = String.format("%02d:%02d",startDate.getHour(),startDate.getMinute());
                    calendarMapper.deleteOperation(Map.of("id",id,"date",date,"time",time));
                    break;
                default:throw new IllegalArgumentException("알 수 없는 예약 유형: " + type);

            }

    }






}
