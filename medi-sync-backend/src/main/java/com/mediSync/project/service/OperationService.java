package com.mediSync.project.service;

import com.mediSync.project.mapper.OperationMapper;
import com.mediSync.project.vo.*;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.annotations.Param;
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

        // ✅ 먼저 수술 insert
        int inserted = operationMapper.insertOperation(operation);
        if (inserted > 0) {
            // ✅ insert 성공 시에만 수술실 상태 변경
            operationMapper.updateRoomInUse(operation.getRoomId());
            return true;
        }
        return false;
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
        int duplicate = operationMapper.checkDuplicateStaff(staff.getOperationId(), staff.getStaffId());
        if (duplicate > 0) {
            throw new IllegalStateException("이미 등록된 의료진입니다.");
        }
        OperationLog log = new OperationLog();
        log.setOperationId(staff.getOperationId());
        log.setAction("의료진 추가: " + staff.getName() + " (" + staff.getPosition() + ")");
        log.setUserName("관리자");
        operationMapper.insertOperationLog(log);
    }

    public List<OperationStaff> getStaffList(Long operationId) {
        return operationMapper.selectOperationStaffList(operationId);
    }

    public List<OperationLog> getOperationLogs(Long operationId) {
        return operationMapper.selectOperationLogs(operationId);
    }
    public List<OperationRoom> selectOperationRoomList(){
        return operationMapper.selectOperationRoomList();
    }
    public List<MedicalStaff> selectStaffByOperationId(Long operationId) {
        return operationMapper.selectStaffByOperationId(operationId);
    }
    @Transactional
    public void deleteOperationStaff(Long operationId, Long staffId) {
        int result = operationMapper.deleteOperationStaff(operationId, staffId);
        if (result == 0) {
            throw new IllegalArgumentException("삭제 대상이 존재하지 않습니다.");
        }
        OperationLog log = new OperationLog();
        log.setOperationId(operationId);
        log.setAction("의료진 삭제");
        log.setUserName("관리자");
    }

//    @Transactional
//    public void completeOperation(Operation operation) {
//        operationMapper.updateResult(operation);
//        operationMapper.updateRoomAvailable(operation.getRoomId());
//        operationMapper.insertOperationLog(
//                new OperationLog(operation.getOperationId(), "SYSTEM", "수술 완료 → 수술실 사용 가능")
//        );
//    }
}

