package com.mediSync.project.mapper;

import com.mediSync.project.vo.Operation;
import com.mediSync.project.vo.OperationLog;
import com.mediSync.project.vo.OperationStaff;
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
    int updateOperationStatus(@Param("operationid") Long operationId, @Param("status") String status);
    int updateResult(Operation op);

    int updateOperation(Operation op);

    // operation_staff 관련
    int insertOperationStaff(OperationStaff staff);
    List<OperationStaff> selectOperationStaffList(Long operationId);

    // 로그
    int insertOperationLog(OperationLog log);
    List<OperationLog> selectOperationLogs(Long operationId);
}
