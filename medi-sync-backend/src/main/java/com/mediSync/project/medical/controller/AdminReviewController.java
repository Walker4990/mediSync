package com.mediSync.project.medical.controller;

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
    public void insertAdminViews(){

    }

    //예약 리뷰 가능 리스트 가져오기
    @GetMapping("/eligible/{patientId}/{adminId}")
    public List<AdminReview> getEligibleReservations(@PathVariable long patientId,
                                                     @PathVariable long adminId){
            List<AdminReview> list = adminReviewService.selectReservationbyreview(patientId, adminId);

        return null;
    }
}
