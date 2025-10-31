package com.mediSync.project.common.mapper;

import com.mediSync.project.common.dto.CalendarDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CalendarMapper {
    List<CalendarDTO> getUserCalendar(Integer userId);
    List<Reservation> getReservation(Integer patient_id);
    List<TestReservation> getTestReservation(Integer patient_id);
    List<TestSchedule> getTestSchedule(Long schedule_id);
    List<Operation> getOperation(Integer patient_id);


}
