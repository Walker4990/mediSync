package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.dto.AdminReviewDTO;
import com.mediSync.project.medical.dto.ReviewDTO;
import com.mediSync.project.medical.dto.ReviewStateDTO;
import com.mediSync.project.medical.vo.AdminReview;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;


@Mapper
public interface AdminReviewMapper {
    List<AdminReviewDTO> selectReservationByReview(
                    @Param("patientId") long patientId,
                    @Param("adminId") long adminId);

    List<AdminReviewDTO> selectTestReservationByReview(
                    @Param("patientId") long patientId,
                    @Param("adminId") long adminId);

    List<AdminReviewDTO> selectOperationByReview(
                    @Param("patientId") long patientId,
                    @Param("adminId") long adminId);

    int insertReservationReview(AdminReview review);

    List<ReviewDTO> selectReviewByAdminId(long id);

    String getReviewTitleByTestSchedule(@Param("typeId")long typeId);
    String getReviewTitleByOperation(@Param("typeId")long typeId);

    ReviewStateDTO selectRatingByAdminId(long adminid);

}
