package com.mediSync.project.room.service;

import com.mediSync.project.operation.mapper.OperationMapper;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.patient.mapper.PatientMapper;
import com.mediSync.project.room.mapper.AdmissionHistoryMapper;
import com.mediSync.project.room.mapper.AdmissionMapper;
import com.mediSync.project.room.mapper.RoomMapper;
import com.mediSync.project.room.vo.Admission;
import com.mediSync.project.room.vo.Room;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdmissionService {

    private final RoomMapper roomMapper;
    private final AdmissionMapper admissionMapper;
    private final AdmissionHistoryMapper admissionHistoryMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final PatientMapper patientMapper;
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
        // ✅ patientId도 함께 조회
        Admission ad = admissionMapper.findAdmissionById(admissionId);

        admissionHistoryMapper.updateDischargeHistory(ad.getPatientId());
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

    @Transactional
    @Scheduled(cron = "0 0 11 * * *", zone = "Asia/Seoul")
    public void processScheduledAdmission(){
        log.info("[Scheduler] 매일 11시 입원 수속 시작");
        // 오늘 입원 예정자 조회
        var scheduledList = admissionMapper.findScheduledAdmissionsForToday();
        if (scheduledList.isEmpty()) {
            log.info("✅ 오늘 입원 예정 환자 없음");
            return;
        }

        scheduledList.forEach(a -> {
            // 1. 상태 변경
            admissionMapper.updateAdmissionStatus(a.getAdmissionId(), "ADMITTED");

            // 2. 병실 인원 증가
            roomMapper.incrementRoomCount(a.getRoomId());

            // 3. 환자 상태 변경
            patientMapper.updatePatientAdmissionStatus(a.getPatientId(), "INPATIENT");

            // 4. 실시간 알림 전송 (웹소켓)
            messagingTemplate.convertAndSend("/topic/admission/update", Map.of(
                    "event", "ADMIT",
                    "patientId", a.getPatientId(),
                    "patientName", a.getPatientName(),
                    "roomNo", a.getRoomNo()
            ));
        });

        log.info("🏥 [Scheduler] 입원 수속 완료 ({}명)", scheduledList.size());
    }
}

