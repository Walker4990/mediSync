package com.mediSync.project.medical.service;

import com.mediSync.project.medical.dto.AdminReviewDTO;
import com.mediSync.project.medical.dto.ReviewDTO;
import com.mediSync.project.medical.dto.ReviewStateDTO;
import com.mediSync.project.medical.mapper.AdminReviewMapper;
import com.mediSync.project.medical.vo.AdminReview;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminReviewService {

    private final AdminReviewMapper adminReviewMapper;

    public List<AdminReviewDTO> selectReservationbyreview(long patientId, long adminId){
        List<AdminReviewDTO> list = new ArrayList<>();
        //patientId, adminId 로 진료 완료 상태 예약만 가져오기

        //reservation
        List<AdminReviewDTO> reList= adminReviewMapper.selectReservationByReview(patientId, adminId);
        if(reList != null && !reList.isEmpty() ){
            for (AdminReviewDTO re : reList){
                re.setName("진료");
                re.setType("진료");
                list.add(re);
            }
        }
        //test_reservation
        List<AdminReviewDTO> teList = adminReviewMapper.selectTestReservationByReview(patientId, adminId);
        if( teList != null && !teList.isEmpty()){
            for (AdminReviewDTO te : teList){
                te.setType("검사");
                list.add(te);
            }
        }

        //operation
        List<AdminReviewDTO> opList = adminReviewMapper.selectOperationByReview(patientId,adminId);
        if(opList != null && !opList.isEmpty()){
            for(AdminReviewDTO op : opList){
                op.setType("수술");
                list.add(op);
            }
        }
        return list;
    }

    public void insertReservationReview(AdminReview review){

        switch (review.getType()){
            case "진료" :
                review.setType("RESERVATION");
                break;
            case "검사" :
                review.setType("TEST");
                break;
            case "수술" :
                review.setType("OPERATION");
                break;
            default:
                review.setType("RESERVATION");
        }
        adminReviewMapper.insertReservationReview(review);
    }

    public List<ReviewDTO> selectReviewByAdminId(long adminId){
        List<ReviewDTO> list =  adminReviewMapper.selectReviewByAdminId(adminId);
        if(list != null && !list.isEmpty()){
            for (ReviewDTO li : list){
                String title = "";
                switch (li.getType()){
                    case "RESERVATION":
                        title = "진료";
                        break;
                    case "TEST":
                        title = adminReviewMapper.getReviewTitleByTestSchedule(li.getTypeId());
                        break;
                    case "OPERATION":
                        title = adminReviewMapper.getReviewTitleByOperation(li.getTypeId());
                        break;
                    default:title = "진료";    
                }
                li.setTitle(title);
            }
        }
        return list;
    }
    //별점 가져오기
    public ReviewStateDTO selectRatingByAdminId(long adminId){

        return adminReviewMapper.selectRatingByAdminId(adminId);
    }













}
