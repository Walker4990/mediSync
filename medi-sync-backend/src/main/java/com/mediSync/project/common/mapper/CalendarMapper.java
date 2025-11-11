package com.mediSync.project.common.mapper;

import com.mediSync.project.common.dto.CalendarDTO;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.patient.dto.CancelDTO;
import com.mediSync.project.patient.dto.NoShowDTO;
import com.mediSync.project.patient.vo.NoShow;
import com.mediSync.project.patient.vo.Reservation;
import com.mediSync.project.test.vo.TestReservation;
import com.mediSync.project.test.vo.TestSchedule;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface CalendarMapper {
    //사용자 페이지
    List<CalendarDTO> getUserCalendar(Integer userId);
    List<CalendarDTO> getReservation(Long patient_id);
    List<TestReservation> getTestReservation(Long patient_id);
    List<CalendarDTO> getTestSchedule(Long schedule_id);
    List<CalendarDTO> getOperation(Long patient_id);

    
    int cancelReservation(Map<String, Object> params);
    int cancelTestReservation(Map<String, Object> params);
    int cancelOperation(Map<String, Object> params);
    
    //관리자 페이지
    List<CalendarDTO> getReservationAll(long adminId);
    List<TestReservation> getTestReservationAll(long adminId);
    List<CalendarDTO> getTestScheduleAll(long adminId);
    List<CalendarDTO> getOperationAll(long adminId);
    
    //관리자 페이지 예약 취소
    int insertCanceledReservation(CancelDTO dto);
    int insertCanceledTestReservation(CancelDTO dto);
    int insertCanceledOperation(CancelDTO dto);

    //이메일 얻기
    String getEmailByReservation(long id);
    String getEmailByTestReservation(long id);
    String getEmailByOperation(long id);

    //노쇼했을때 상태 노쇼로 업데이트
    int updateNoShowReservation();
    int updateNoShowTestReservation();
    int updateNoShowOperation();

    //등록 안된 노쇼 값 불러오기
    List<NoShow> selectNoshowsReservation();
    List<NoShow> selectNoshowsTestReservation();
    List<NoShow> selectNoshowsOperation();
    
    //등록
    int insertNoshows(NoShow vo);

    //이메일 보낼 리스트 가져오기
    List<NoShowDTO> selectSendNoShowEmail();

    //이메일 보낸 후 상태 업데이트
    int updateNoShowList(long noshowId);
}

