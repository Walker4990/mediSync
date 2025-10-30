package com.mediSync.project.service;

import com.mediSync.project.dto.CalendarDTO;
import com.mediSync.project.mapper.CalendarMapper;
import com.mediSync.project.vo.Operation;
import com.mediSync.project.vo.Reservation;
import com.mediSync.project.vo.TestReservation;
import com.mediSync.project.vo.TestSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private  final CalendarMapper calendarMapper;
    public List<CalendarDTO> getUserCalendar(Integer patient_id){
       return calendarMapper.getUserCalendar(patient_id);
    }
    //진료예약 정보 가져오기
    public List<Reservation> getReservation(Integer patient_id){
        return  calendarMapper.getReservation(patient_id);
    }
    //검사 정보 가져오기
    public List<TestReservation> getTestReservation(Integer patient_id){
        return calendarMapper.getTestReservation(patient_id);
    }
    //검사 이름 및 날짜&시간 가져오기
    public List<TestSchedule> getTestSchedule(Long schedule_id){
        return calendarMapper.getTestSchedule(schedule_id);
    }

    //수술 예약 정보 가져오기
    public List<Operation> getOperation(Integer patient_id){
        return calendarMapper.getOperation(patient_id);
    }






}
