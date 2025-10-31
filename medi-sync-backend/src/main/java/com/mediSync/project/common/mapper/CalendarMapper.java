package com.mediSync.project.common.mapper;

import com.mediSync.project.common.dto.CalendarDTO;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.patient.vo.Reservation;
import com.mediSync.project.test.vo.TestReservation;
import com.mediSync.project.test.vo.TestSchedule;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface CalendarMapper {
    List<CalendarDTO> getUserCalendar(Integer userId);
    List<CalendarDTO> getReservation(Long patient_id);
    List<TestReservation> getTestReservation(Long patient_id);
    List<CalendarDTO> getTestSchedule(Long schedule_id);
    List<CalendarDTO> getOperation(Long patient_id);

    int deleteReservation(Map<String, Object> params);
    int deleteTestSchedule(Map<String, Object> params);
    int deleteOperation(Map<String, Object> params);
}
