package com.mediSync.project.service;

import com.mediSync.project.mapper.OperationMapper;
import com.mediSync.project.vo.Operation;
import com.mediSync.project.vo.OperationLog;
import com.mediSync.project.vo.OperationStaff;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OperationService {
    private final OperationMapper operationMapper;

    @Transactional
    public boolean reserveOperation(Operation operation) {
        int conflict = operationMapper.checkScheduleConflict(
                operation.getRoomId(),
                operation.getScheduledDate().toString(),
                operation.getScheduledTime().toString()
        );
        if (conflict > 0) {
            throw new IllegalStateException("이미 예약된 수술실/시간입니다.");
        }
        return operationMapper.insertOperation(operation) > 0;
    }

    public List<Operation> selectOperationList() {
        return operationMapper.selectOperationList();
    }

    public Operation getOperationById(Long operationId) {
        return operationMapper.getOperationById(operationId);
    }
    public int updateOperationStatus(Long operationId, String status) {
        return operationMapper.updateOperationStatus(operationId, status);
    }
    public int completeOperation(Operation operation){
        return operationMapper.updateResult(operation);
    }

    // ✅ 예약 가능 여부 조회
    public boolean isAvailable(String scheduledDate, String scheduledTime, int roomId) {
        int count = operationMapper.checkScheduleConflict((long) roomId, scheduledDate, scheduledTime);
        return count == 0; // 0이면 예약 가능
    }

    @Transactional
    public void updateOperation(Operation operation) {
        operationMapper.updateOperation(operation);

        OperationLog log = new OperationLog();
        log.setOperationId(operation.getOperationId());
        log.setAction("수술 정보 수정");
        log.setUserName("관리자");
        operationMapper.insertOperationLog(log);
    }

    @Transactional
    public void addStaff(OperationStaff staff) {
        operationMapper.insertOperationStaff(staff);

        OperationLog log = new OperationLog();
        log.setOperationId(staff.getOperationId());
        log.setAction("의료진 추가: " + staff.getName() + " (" + staff.getRole() + ")");
        log.setUserName("관리자");
        operationMapper.insertOperationLog(log);
    }

    public List<OperationStaff> getStaffList(Long operationId) {
        return operationMapper.selectOperationStaffList(operationId);
    }

    public List<OperationLog> getOperationLogs(Long operationId) {
        return operationMapper.selectOperationLogs(operationId);
    }
}

