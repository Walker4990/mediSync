package com.mediSync.project.mapper;

import com.mediSync.project.dto.CalendarDTO;
import com.mediSync.project.vo.Operation;
import com.mediSync.project.vo.Reservation;
import com.mediSync.project.vo.TestReservation;
import com.mediSync.project.vo.TestSchedule;
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
