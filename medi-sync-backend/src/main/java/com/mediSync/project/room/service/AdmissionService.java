package com.mediSync.project.room.service;

import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
    private final FinanceTransactionMapper  financeTransactionMapper;


    public List<Admission> getAdmissionList(){
        return  admissionMapper.getAdmissionList();
    }

    public int updateDischarge(Long admissionId){
        int updated = 0;
        try{
            Long roomId = admissionMapper.findRoomIdByAdmissionId(admissionId);
            if (roomId == null) {
                throw new IllegalStateException("해당 입원 환자의 병실 정보를 찾을 수 없습니다.");
            }

            //  퇴원 처리
            updated = admissionMapper.updateDischarge(admissionId);

            //  병실 인원 감소
            if (updated > 0) {
                admissionMapper.decreaseRoomCount(roomId);
                // 인원 확인 후 병실 상태 AVAILABLE로 변경
                admissionMapper.updateRoomStatusIfAvailable(roomId);
            }
            // ✅ patientId도 함께 조회
            Admission ad = admissionMapper.findAdmissionById(admissionId);

            admissionHistoryMapper.updateDischargeHistory(ad.getPatientId());
            messagingTemplate.convertAndSend("/topic/admission/discharge", Map.of(
                    "event", "DISCHARGE",
                    "patientId", ad.getPatientId(),
                    "patientName", ad.getPatientName(),
                    "roomNo", ad.getRoomNo()
            ));
            patientMapper.updatePatientAdmissionStatus(ad.getPatientId(), "OUTPATIENT");
            patientMapper.updatePatientRoom(ad.getPatientId(), null);
            log.info("✅ 자동 퇴원 처리 완료: {}", ad.getPatientName());
            } catch (Exception e) {
                log.error("자동 퇴원 처리 실패: {}", e.getMessage());
            }
            return updated;
    }
    public List<Admission> getAdmissionsByRoom(Long roomId){
        return admissionMapper.getAdmissionsByRoom(roomId);
    }

    @Transactional
    public int updateExpectedDischargeDate(LocalDateTime dischargedAt, Long admissionId) {

        // 퇴원 일정 업데이트
        Map<String, Object> params = new HashMap<>();
        params.put("dischargedAt", dischargedAt);
        params.put("admissionId", admissionId);

        // 입원 정보 조회
        Admission admission = admissionMapper.findAdmissionById(admissionId);
        Room room = roomMapper.findCostByRoomId(admission.getRoomId());

        // 입원 기간 조회
        long days = 1;
        if (admission.getAdmittedAt() != null && dischargedAt != null){
            days = ChronoUnit.DAYS.between(admission.getAdmittedAt(), dischargedAt.toLocalDate());
            if (days == 0) days = 1;
        }
        BigDecimal totalCost = room.getDailyCost().multiply(BigDecimal.valueOf(days));

        // 기존 finance_transaction 갱신
        FinanceTransaction tx = financeTransactionMapper.findByRef(admissionId,"RECORD");
        if (tx != null) {
            tx.setAmount(totalCost);
            tx.setDescription(
                    (room.getRoomType().equals("TWO_PERSON") ? "2인실" : "6인실")
                            + " 입원비 기간 변경 (" + days + "일 × " + room.getDailyCost() + "원)"
            );
            log.info("💰 입원비 자동 재계산 완료: {} ({}일, {}원)", admissionId, days, totalCost);
            financeTransactionMapper.updateFinance(tx);
        }


        return admissionMapper.updateExpectedDischargeDate(params);
    }

    public List<Admission> getDischargeAlerts() {
        return admissionMapper.getDischargeAlerts();
    }

    // D-Day만 WebSocket 실시간 전송
    @Scheduled(cron = "0 * * * * *")
    public void pushTodayAlerts() {
        List<Admission> ddayList = admissionMapper.getDischargeAlertsDday();
        if (!ddayList.isEmpty()) {
            messagingTemplate.convertAndSend("/topic/admission/discharge", ddayList);
            for(Admission a : ddayList) {
                updateDischarge(a.getAdmissionId());
            }
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

        Room newRoomInfo = roomMapper.findCostByRoomId(newRoomId);
        BigDecimal newCost = newRoomInfo.getDailyCost();

        log.info("🏥 병실 이동 요청: admissionId={}, oldRoomId={}, newRoomId={}", admissionId, oldRoomId, newRoomId);

        FinanceTransaction ft = financeTransactionMapper.findByRef(admissionId, "RECORD");
        if (ft == null) {
            log.warn("⚠️ 재무 기록 없음: admissionId={}", admissionId);
        }
        if(ft != null) {
            ft.setAmount(newCost);
            ft.setDescription(
                    newRoomInfo.getRoomType().equals("TWO_PERSON") ? "2인실" : "6인실"
                            + " 변경 후 입원비 단가 조정 ( " + newCost +"원)");
            financeTransactionMapper.updateFinance(ft);
        }
        return updateResult;
    }

    @Transactional
    public void processScheduledAdmission(){
        try{
        log.info("[Scheduler] 매일 11시 입원 수속 시작");
        // 오늘 입원 예정자 조회
        var scheduledList = admissionMapper.findScheduledAdmissionsForToday();
        if (scheduledList.isEmpty()) {
            log.info("✅ 오늘 입원 예정 환자 없음");
            return;
        }

        scheduledList.forEach(a -> {

            boolean alreadyAdmitted = admissionMapper.countActiveAdmissionsByPatient(a.getPatientId()) > 0;
            if (alreadyAdmitted) {
                log.warn("⚠️ 환자 {}({})는 이미 입원 중이므로 스킵", a.getPatientId(), a.getPatientName());
                return; // skip 처리
            }

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
            // 병실 정보 조회
            Room roomInfo = roomMapper.findCostByRoomId(a.getRoomId());

            // 5. 입원 기간 및 비용 계산
            long days;
            if (a.getDischargedAt() == null) {
                days = 1;
            } else {
                days = ChronoUnit.DAYS.between(a.getAdmittedAt(), a.getDischargedAt().toLocalDate());
                if (days == 0) days = 1;
            }

            BigDecimal totalCost = roomInfo.getDailyCost().multiply(BigDecimal.valueOf(days));

            FinanceTransaction ft = new FinanceTransaction();
            ft.setRefType("RECORD");
            ft.setRefId(a.getAdmissionId());
            ft.setPatientId(a.getPatientId());
            ft.setAdminId(null);
            ft.setType("INCOME");
            ft.setCategory("ADMISSION");
            ft.setAmount(totalCost);
            ft.setDescription(
                    (roomInfo.getRoomType().equals("TWO_PERSON") ? "2인실" : "6인실")
                            + " 입원비 (" + days + "일 × " + roomInfo.getDailyCost() + "원)"
            );
            ft.setStatus("COMPLETED");

            financeTransactionMapper.insertFinance(ft);
        });

        log.info("🏥 [Scheduler] 입원 수속 완료 ({}명)", scheduledList.size());
        } catch(Exception e){
            log.error("❌ Admission update rollback 발생: {}", e.getMessage());
        }
    }
}

