package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.vo.AdminReview;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminReviewMapper {
    List<AdminReview> selectReservationbyreview(@Param("patientId") long patientId, @Param("adminId") long adminId);
}
