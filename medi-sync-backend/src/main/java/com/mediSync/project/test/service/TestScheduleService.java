package com.mediSync.project.test.service;

import com.mediSync.project.test.mapper.TestScheduleMapper;
import com.mediSync.project.test.vo.TestSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TestScheduleService {

    private final TestScheduleMapper testScheduleMapper;

    // 검사 예약 가능 여부 확인
    public boolean checkAvailability(String testCode, String testDate, String testTime) {
        TestSchedule schedule = testScheduleMapper.findByCodeAndDate(testCode, testDate, testTime);

        // ✅ 슬롯이 아예 없으면 예약 가능으로 표시
        if (schedule == null) {
            return true;
        }

        if ("FULL".equals(schedule.getStatus())) return false;

        // ✅ reserved < capacity면 예약 가능
        return schedule.getReserved() < schedule.getCapacity();
    }

    // 검사 예약하기
    @Transactional
    public int reserveSlot(String testCode, LocalDate testDate, String testTime) {
        // 1️⃣ 먼저 예약 시도
        int updated = testScheduleMapper.reserveSlot(testCode, testDate, testTime);

        // 2️⃣ 해당 시간대 row가 아직 없으면 (업데이트된 행이 0)
        if (updated == 0) {
            // ➕ 해당 시간대만 새로 insert
            testScheduleMapper.insertSchedule(testCode, testDate.toString(), testTime);

            // ✅ insert 후 다시 한 번 예약 시도
            updated = testScheduleMapper.reserveSlot(testCode, testDate, testTime);
        }

        return updated;
    }

    public int updateTestSchedule(TestSchedule testSchedule) {
        return testScheduleMapper.updateTestSchedule(testSchedule);
    }
}

