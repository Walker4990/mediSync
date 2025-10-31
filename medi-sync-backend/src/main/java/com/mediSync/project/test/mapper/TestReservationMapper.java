package com.mediSync.project.test.mapper;

import com.mediSync.project.test.vo.TestReservation;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface TestReservationMapper {
    List<TestReservation> selectTestReservation();
    int insertTestReservation(TestReservation tr);
    int updateTestReservation(TestReservation tr);
    int deleteTestReservation(Long reservationId);
    TestReservation findTestReservationByPatientId(Long patientId);
    List<TestReservation> selectByGroup(@Param("group") String group);
    List<TestReservation> searchByGroupAndKeyword(@Param("group") String group,
                                                  @Param("keyword") String keyword,
                                                  @Param("startDate") String startDate,
                                                  @Param("endDate") String endDate);
    TestReservation selectById(Long reservationId);
    int updateStatus(
            @Param("reservationId") Long reservationId,
            @Param("status") String status
    );
}
