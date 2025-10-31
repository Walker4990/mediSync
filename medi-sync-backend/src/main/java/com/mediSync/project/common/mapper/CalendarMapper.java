package com.mediSync.project.common.mapper;

import com.mediSync.project.common.dto.CalendarDTO;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.patient.vo.Reservation;
import com.mediSync.project.test.vo.TestReservation;
import com.mediSync.project.test.vo.TestSchedule;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CalendarMapper {
    List<CalendarDTO> getUserCalendar(Integer userId);
    List<CalendarDTO> getReservation(Integer patient_id);
    List<TestReservation> getTestReservation(Integer patient_id);
    List<CalendarDTO> getTestSchedule(Long schedule_id);
    List<CalendarDTO> getOperation(Integer patient_id);
    CalendarDTO getScheduleDetail(String date, Integer patientId);

}
