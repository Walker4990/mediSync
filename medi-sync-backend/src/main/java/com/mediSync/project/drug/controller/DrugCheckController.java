package com.mediSync.project.drug.controller;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.dto.DrugLogDTO;
import com.mediSync.project.drug.service.DrugCheckService;
import com.mediSync.project.drug.vo.DrugCheckDetail;
import com.mediSync.project.drug.vo.DrugLog;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.annotations.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;
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

        List<DrugCheckDTO> list = drugCheckService.getCheckedDrug(checkId);
        System.out.println("검사 상세 리스트 : "+ list);
        return list;
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

    @PutMapping("/drug/{drugCode}/{quantity}/{memo}")
    public int inspectionDrug(@PathVariable String drugCode, @PathVariable int quantity, @PathVariable String memo){
        System.out.println("코드 : "+ drugCode + " 수량 : " + quantity + " 메모 : "+ memo);
        drugCheckService.updateinspectionDrugByDrugCode(drugCode,quantity,memo);

        return 0;
    }

    @GetMapping("/disponse/log")
    public List<DrugLogDTO> getDrugLog(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(required = false) String drugCode){

        int offset = (page-1)*size;
        System.out.println("폐기 기록 순서 : " +sort+ " 코드 : " +  drugCode );
        List<DrugLogDTO> list =  drugCheckService.getDrugLog(sort,drugCode,size,offset);
        System.out.println("약품 로그 : "+ list);
        return list;
    }

}
