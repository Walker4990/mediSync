package com.mediSync.project.test.mapper;

import com.mediSync.project.test.vo.TestSchedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;

@Mapper
public interface TestScheduleMapper {
    TestSchedule findByCodeAndDate(
            @Param("testCode") String testCode,
            @Param("testDate") String testDate,
            @Param("testTime") String testTime
    );

    // 예약 슬롯 신규 생성 (test_time 포함)
    int insertSchedule(
            @Param("testCode") String testCode,
            @Param("testDate") String testDate,
            @Param("testTime") String testTime
    );

    // 예약 시 reserved + 1 (test_time 포함)
    int reserveSlot(
            @Param("testCode") String testCode,
            @Param("testDate") LocalDate testDate,
            @Param("testTime") String testTime
    );
    int updateTestSchedule(TestSchedule testSchedule);
    int increaseReservedCount(Long scheduleId);
    int decreaseReservedCount(Long scheduleId);
}
