package com.mediSync.project.test.service;

import com.mediSync.project.patient.dto.ReservationDTO;
import com.mediSync.project.test.mapper.TestReservationMapper;
import com.mediSync.project.test.mapper.TestScheduleMapper;
import com.mediSync.project.test.vo.TestReservation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TestReservationService {
    private final TestReservationMapper testReservationMapper;
    private final TestScheduleMapper testScheduleMapper;

    public List<TestReservation> selectTestReservation(){
        return testReservationMapper.selectTestReservation();
    }
    public int insertTestReservation(TestReservation tr){
        return testReservationMapper.insertTestReservation(tr);
    }
    @Transactional
    public int updateTestReservation(TestReservation tr) {
        // 기존 예약 정보 조회
        TestReservation existing = testReservationMapper.selectById(tr.getReservationId());
        if (existing == null) return 0;

        // 만약 스케줄이 변경됐다면 (다른 시간대/검사로 수정)
        if (!existing.getScheduleId().equals(tr.getScheduleId())) {
            // 기존 예약 스케줄 reserved -1
            testScheduleMapper.decreaseReservedCount(existing.getScheduleId());
            // 새로운 스케줄 reserved +1
            testScheduleMapper.increaseReservedCount(tr.getScheduleId());
        }

        return testReservationMapper.updateTestReservation(tr);
    }

    // ✅ 예약 삭제
    @Transactional
    public int deleteTestReservation(Long reservationId) {
        // 삭제 전 기존 예약 조회
        TestReservation existing = testReservationMapper.selectById(reservationId);
        if (existing == null) return 0;

        int result = testReservationMapper.deleteTestReservation(reservationId);
        if (result > 0) {
            // 삭제 시 reserved 감소
            testScheduleMapper.decreaseReservedCount(existing.getScheduleId());
        }

        return result;
    }

    public TestReservation findTestReservationByPatientId(Long patientId){
        return testReservationMapper.findTestReservationByPatientId(patientId);
    }
    public List<TestReservation> selectByGroup(String group){
        return testReservationMapper.selectByGroup(group);
    }
    public List<TestReservation> searchByGroupAndKeyword(String group, String keyword, String startDate, String endDate){
        return testReservationMapper.searchByGroupAndKeyword(group, keyword,  startDate, endDate);
    }

    public List<ReservationDTO> findTestReservationBetween(LocalDateTime start, LocalDateTime end){
        return testReservationMapper.findTestReservationBetween(start, end);
    }
    public Map<String, Object> selectPaged(int page, int size) {
        int offset = (page - 1) * size;

        List<TestReservation> items = testReservationMapper.selectPaged(offset, size);
        int totalCount = testReservationMapper.countAll();

        int totalPages = (int) Math.ceil((double) totalCount / size);

        return Map.of(
                "items", items,
                "totalPages", totalPages
        );
    }
    public Map<String, Object> selectPagedByGroup(String group, int page, int size) {
        int offset = (page - 1) * size;

        List<TestReservation> items = testReservationMapper.selectPagedByGroup(group, offset, size);
        int totalCount = testReservationMapper.countByGroup(group);

        int totalPages = (int) Math.ceil((double) totalCount / size);

        return Map.of(
                "items", items,
                "totalPages", totalPages
        );
    }
}
