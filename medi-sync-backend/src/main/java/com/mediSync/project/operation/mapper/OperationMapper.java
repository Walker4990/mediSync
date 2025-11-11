package com.mediSync.project.operation.mapper;

import com.mediSync.project.medical.vo.AdminAccount;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.operation.vo.OperationLog;
import com.mediSync.project.operation.vo.OperationRoom;
import com.mediSync.project.operation.vo.OperationStaff;
import com.mediSync.project.patient.dto.ReservationDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Mapper
public interface OperationMapper {
    int insertOperation(Operation op);

    List<Operation> selectOperationList();

    Operation getOperationById(Long operationId);

    int checkScheduleConflict(@Param("roomId") Long roomId,
                              @Param("scheduledDate") LocalDate scheduledDate,
                              @Param("scheduledTime") LocalTime scheduledTime);


    int updateOperationStatus(@Param("operationId") Long operationId, @Param("status") String status);

    int updateResult(Operation op);

    int updateOperation(Operation op);

    // operation_staff 관련
    int insertOperationStaff(OperationStaff staff);
    List<OperationStaff> selectOperationStaffList(@Param("operationId")Long operationId);

    // 로그
    int insertOperationLog(OperationLog log);
    List<OperationLog> selectOperationLogs(Long operationId);

    // 수술방 조회
    List<OperationRoom> selectOperationRoomList();

    List<AdminAccount> selectStaffByOperationId(Long operationId);

    int deleteOperationStaff(@Param("operationId") Long operationId,
                             @Param("staffId") Long staffId);
    int checkDuplicateStaff(@Param("operationId") Long operationId,
                            @Param("adminId") Long adminId);

    List<OperationRoom> selectAvailableRooms(LocalDate scheduledDate, LocalTime scheduledTime);
    int updateScheduledToProgress();
    int updateProgressToCompleted();

    OperationRoom getRoomById(Long roomId);
    int updateRoomAvailable(Long roomId);
<<<<<<< HEAD
    List<Operation> selectByDate(LocalDate scheduledDate);
=======

    List<ReservationDTO> findOperationBetween(@Param("start") LocalDateTime start,
                                              @Param("end")LocalDateTime end);

    int canceledOperation(long id);

>>>>>>> main
}
