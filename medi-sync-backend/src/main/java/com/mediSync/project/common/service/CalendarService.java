package com.mediSync.project.common.service;

import com.mediSync.project.common.dto.CalendarDTO;
import com.mediSync.project.common.mapper.CalendarMapper;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.patient.vo.Reservation;
import com.mediSync.project.test.vo.TestReservation;
import com.mediSync.project.test.vo.TestSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    public List<CalendarDTO> getReservation(Integer patient_id){
        return  calendarMapper.getReservation(patient_id);
    }
    //검사 정보 가져오기
    public List<TestReservation> getTestReservation(Integer patient_id){
        return calendarMapper.getTestReservation(patient_id);
    }
    //검사 이름 및 날짜&시간 가져오기
    public List<CalendarDTO> getTestSchedule(Long schedule_id){
        return calendarMapper.getTestSchedule(schedule_id);
    }

    //수술 예약 정보 가져오기
    public List<CalendarDTO> getOperation(Integer patient_id){
        return calendarMapper.getOperation(patient_id);
    }

    //진료 예약 삭제하기
    public int deleteReservation(Map<String, Object> params){
        return calendarMapper.deleteReservation(params);
    }

    //검사 예약 삭제하기
    public int deleteTestSchedule(Map<String,Object> params){
        return calendarMapper.deleteTestSchedule(params);
    }

    //수술 예약 삭제하기
    public int deleteOperation(Map<String,Object> params){
        return calendarMapper.deleteOperation(params);
    }






}
