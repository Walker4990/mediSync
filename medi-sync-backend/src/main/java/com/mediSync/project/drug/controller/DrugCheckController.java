package com.mediSync.project.drug.controller;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.service.DrugCheckService;
import com.mediSync.project.drug.vo.DrugCheckDetail;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.annotations.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/inspection")
@RestController
@RequiredArgsConstructor
public class DrugCheckController {

    private final DrugCheckService drugCheckService;

    //검사가 안된 리스트 가져오기
    @GetMapping
    public List<DrugCheckDTO> getDrugDTOInfo(){
        return drugCheckService.getNotCheckedDTO();
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerIncpection(@RequestBody DrugCheckDTO dto){
        System.out.println("약품 코드 : "+ dto.getDrugCode());
        for (DrugCheckDTO.Detail d : dto.getInspections()){
            System.out.println("상태 : "+ d.getStatus()+ "수량 : "+ d.getQuantity() + "비고 : "+ d.getNote());
        }

        int res = drugCheckService.registerInspection(dto);

        return ResponseEntity.ok("등록 성공!");
    }
    @GetMapping("/month")
    public List<DrugCheckDTO>getAllCheckedDrug(){
        return drugCheckService.getAllCheckedDrug();
    }
    @GetMapping("/month/detail/{checkId}")
    public List<DrugCheckDTO>getCheckedDrugByCheckId(@PathVariable long checkId){
        return drugCheckService.getCheckedDrug(checkId);
    }

    @PutMapping("/dispose/{detailId}/{quantity}")
    public int updateDrugDispose(@PathVariable long detailId,@PathVariable int quantity){
        drugCheckService.updateDrugDispose(detailId,quantity);
        return 0;
    }
    @PutMapping("/check/{detailId}")
    public int updateCheck(@PathVariable int detailId){
    drugCheckService.updateCheck(detailId);
        return 0;
    }

}
