package com.mediSync.project.medical.controller;

import com.mediSync.project.medical.dto.AdminReviewDTO;
import com.mediSync.project.medical.dto.ReviewDTO;
import com.mediSync.project.medical.dto.ReviewStateDTO;
import com.mediSync.project.medical.service.AdminReviewService;
import com.mediSync.project.medical.vo.AdminReview;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    //등록하기
    @PostMapping
    public void insertAdminViews(@RequestBody AdminReview review){
        System.out.println("등록 값 : "+ review);
        adminReviewService.insertReservationReview(review);
        System.out.println("등록 완료:) ");
    }

    //예약 리뷰 가능 리스트 가져오기
    @GetMapping("/eligible/{patientId}/{adminId}")
    public List<AdminReviewDTO> getEligibleReservations(@PathVariable long patientId,
                                                     @PathVariable long adminId){
            List<AdminReviewDTO> list = adminReviewService.selectReservationbyreview(patientId, adminId);
            System.out.println("총 리뷰가능 리스트 : "+list);
        return list;
    }

    //후기 리스트 가져오기
    @GetMapping("/list/{adminId}")
    public List<ReviewDTO> selectReviewByAdminId(@PathVariable long adminId){
        List<ReviewDTO> list = adminReviewService.selectReviewByAdminId(adminId);

        System.out.println("후기 리스트 : "+ list);
        return list;
    }
    
    //해당 의사의 별점 가져오기
    @GetMapping("/rating/{adminId}")
    public ReviewStateDTO selectRatingByAdminid(@PathVariable long adminId){
        ReviewStateDTO dto = adminReviewService.selectRatingByAdminId(adminId);
        System.out.println("별점 : "+ dto);
        return dto;
    }

}
