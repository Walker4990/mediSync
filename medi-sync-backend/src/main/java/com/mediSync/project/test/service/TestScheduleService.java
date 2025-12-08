package com.mediSync.project.test.service;

import com.mediSync.project.test.mapper.TestScheduleMapper;
import com.mediSync.project.test.vo.TestSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestScheduleService {

    private final TestScheduleMapper testScheduleMapper;
    private final RedisTemplate<String, Object> redis;

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

    @Transactional
    public int reserveSlot(String testCode, LocalDate testDate, String testTime) {

        String key = "slot:lock:" + testCode + ":" + testDate + ":" + testTime;

        Boolean acquired = redis.opsForValue()
                .setIfAbsent(key, "1", Duration.ofSeconds(2));

        if (Boolean.FALSE.equals(acquired)) {
            return -1; // 락 경합 → 재시도 요청
        }

        try {
            // slot row는 이미 존재하므로 insert 필요 없음
            return testScheduleMapper.reserveSlot(testCode, testDate, testTime);

        } finally {
            redis.delete(key);
        }
    }


    public int updateTestSchedule(TestSchedule testSchedule) {
        return testScheduleMapper.updateTestSchedule(testSchedule);
    }
}

