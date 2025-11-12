package com.mediSync.project.medical.service;

import com.mediSync.project.medical.mapper.AdminReviewMapper;
import com.mediSync.project.medical.vo.AdminReview;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminReviewService {

    private final AdminReviewMapper adminReviewMapper;

    public List<AdminReview> selectReservationbyreview(long patientId, long adminId){
        //patientId, adminId 로 진료 완료 상태 예약만 가져오기
        adminReviewMapper.selectReservationbyreview(patientId, adminId);
        //이미 리뷰가 작성된 예약은 제외

        //나머지 리스트 반환


        return null;
    }
}
