package com.mediSync.project.operation.mapper;

import com.mediSync.project.medical.vo.MedicalStaff;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.operation.vo.OperationLog;
import com.mediSync.project.operation.vo.OperationRoom;
import com.mediSync.project.operation.vo.OperationStaff;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OperationMapper {
    int insertOperation(Operation op);
    List<Operation> selectOperationList();
    Operation getOperationById(Long operationId);
    int checkScheduleConflict(@Param("roomId") Long roomId,
                              @Param("scheduledDate") String scheduledDate,
                              @Param("scheduledTime") String scheduledTime);
    int updateOperationStatus(@Param("operationId") Long operationId, @Param("status") String status);
    int updateResult(Operation op);

    int updateOperation(Operation op);

    // operation_staff 관련
    int insertOperationStaff(OperationStaff staff);
    List<OperationStaff> selectOperationStaffList(Long operationId);

    // 로그
    int insertOperationLog(OperationLog log);
    List<OperationLog> selectOperationLogs(Long operationId);

    // 수술방 조회
    List<OperationRoom> selectOperationRoomList();

    List<MedicalStaff> selectStaffByOperationId(Long operationId);

    int deleteOperationStaff(@Param("operationId") Long operationId,
                             @Param("staffId") Long staffId);
    int checkDuplicateStaff(@Param("operationId") Long operationId,
                            @Param("medicalStaffId") Long medicalStaffId);

    int updateRoomInUse(Long roomId);
    List<OperationRoom> selectAvailableRooms();
    int updateScheduledToProgress();
    int updateProgressToCompleted();

    OperationRoom getRoomById(Long roomId);
    int updateRoomAvailable(Long roomId);
}
