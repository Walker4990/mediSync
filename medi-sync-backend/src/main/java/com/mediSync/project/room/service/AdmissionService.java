package com.mediSync.project.room.service;

import com.mediSync.project.operation.mapper.OperationMapper;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.room.mapper.AdmissionMapper;
import com.mediSync.project.room.mapper.RoomMapper;
import com.mediSync.project.room.vo.Admission;
import com.mediSync.project.room.vo.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdmissionService {

    private final RoomMapper roomMapper;
    private final AdmissionMapper admissionMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public List<Admission> getAdmissionList(){
        return  admissionMapper.getAdmissionList();
    }

    public int updateDischarge(Long admissionId){
        Long roomId = admissionMapper.findRoomIdByAdmissionId(admissionId);
        if (roomId == null) {
            throw new IllegalStateException("해당 입원 환자의 병실 정보를 찾을 수 없습니다.");
        }

        //  퇴원 처리
        int updated = admissionMapper.updateDischarge(admissionId);

        //  병실 인원 감소
        if (updated > 0) {
            admissionMapper.decreaseRoomCount(roomId);
            // 인원 확인 후 병실 상태 AVAILABLE로 변경
            admissionMapper.updateRoomStatusIfAvailable(roomId);
        }

        return updated;
    }
    public List<Admission> getAdmissionsByRoom(Long roomId){
        return admissionMapper.getAdmissionsByRoom(roomId);
    }
    @Transactional
    public int updateExpectedDischargeDate(LocalDateTime dischargedAt, Long admissionId) {
        Map<String, Object> params = new HashMap<>();
        params.put("dischargedAt", dischargedAt);
        params.put("admissionId", admissionId);
        return admissionMapper.updateExpectedDischargeDate(params);
    }

    public List<Admission> getDischargeAlerts() {
        return admissionMapper.getDischargeAlerts();
    }

    // D-Day만 WebSocket 실시간 전송
    @Scheduled(cron = "0 0 * * * *") // 매시 정각마다
    public void pushTodayAlerts() {
        List<Admission> ddayList = admissionMapper.getDischargeAlertsDday();
        if (!ddayList.isEmpty()) {
            messagingTemplate.convertAndSend("/topic/admission/discharge", ddayList);
        }
    }
    public List<Room> findAvailableRoomsForTransfer(String department, Long currentRoomId){
        Map<String, Object> params = new HashMap<>();
        params.put("department", department);
        params.put("currentRoomId", currentRoomId);
        return admissionMapper.findAvailableRoomsForTransfer(params);
    }

    @Transactional
    public int transferRoom(Long admissionId, Long newRoomId) {
        // 1️⃣ 현재 병실 정보 가져오기
        Admission admission = admissionMapper.findAdmissionById(admissionId);
        Long oldRoomId = admission.getRoomId();

        // 2️⃣ 입원 기록 병실 변경
        int updateResult = admissionMapper.updateRoom(admissionId, newRoomId);

        // 3️⃣ 병실 인원 갱신
        admissionMapper.decreaseRoomCount(oldRoomId);
        roomMapper.incrementRoomCount(newRoomId);

        return updateResult;
    }

}

