package com.mediSync.project.drug.controller;

import com.mediSync.project.drug.dto.DrugDTO;
import com.mediSync.project.drug.service.DrugCheckService;
import com.mediSync.project.drug.service.DrugService;
import com.mediSync.project.drug.vo.Drug;
import com.mediSync.project.drug.vo.DrugLog;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/drug")
public class DrugController {

    private final DrugService drugService;
    private final DrugCheckService drugCheckService;

    @GetMapping("/all")
    public List<DrugDTO> selectAllDrug() {
        return drugService.selectAllDrug();
    }
    //  자동완성 검색용 (GET)
    @GetMapping("/search")
    public ResponseEntity<List<Drug>> searchDrugs(@RequestParam("keyword") String keyword,
                                                  @RequestParam(value = "type", required = false) String type) {
        List<Drug> result;

        // 주사 검색이면 unit='주사'만
        if ("INJECTION".equalsIgnoreCase(type)) {
            result = drugService.searchInjectionByKeyword(keyword);
        } else {
            result = drugService.searchDrugsByKeyword(keyword);
        }

        return ResponseEntity.ok(result);
    }
    //  단일 조회용 (GET /api/drug/{drugCode})
    @GetMapping("/{drugCode}")
    public Drug selectDrugByDrugCode(@PathVariable String drugCode) {
        return drugService.selectDrugByDrugCode(drugCode);
    }

    @PostMapping("/insert")
    public ResponseEntity<Map<String, Object>> insertDrug(@RequestBody Drug drug) {
        System.out.println("📥 받은 데이터: " + drug);
        int result = drugService.insertDrug(drug);
        Map<String,Object> map = new HashMap<>();
        map.put("success", result > 0);
        map.put("message", result > 0 ? "등록 성공!" : " 등록 실패");
        return ResponseEntity.ok(map);
    }
    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateDrug(@RequestBody Drug drug) {
        //기존 정보 가져오기
        Drug origin = drugService.selectDrugByDrugCode(drug.getDrugCode());
        //int result = drugService.editDrug(drug);
        Map<String, Object> map = new HashMap<>();
        System.out.println("갱신할 약 정보 : "+ drug);


        //map.put("success", result > 0);
        //map.put("message", result > 0 ? "수정 성공!" : "수정 실패");

        //새로 업데이트된 정보 가져오기
        Drug newDrug = drugService.selectDrugByDrugCode(drug.getDrugCode());
        DrugLog log = new DrugLog();
        log.setDrugCode(drug.getDrugCode());

        //만약 수량이 수정됐다면 로그 남기기



        return ResponseEntity.ok(map);
    }
    @DeleteMapping("/{drugCode}")
    public ResponseEntity<Map<String, Object>> deleteDrug(@PathVariable String drugCode) {
        int result = drugService.deleteDrug(drugCode);
        Map<String, Object> map = new HashMap<>();
        map.put("success", result > 0);
        map.put("message", result > 0 ? "삭제 성공!" : "삭제 실패");
        return ResponseEntity.ok(map);
    }
    @GetMapping("/page")
    public Map<String, Object> getPagedDrugs(
            @RequestParam int page,
            @RequestParam int size
    ) {
        return drugService.getPagedDrugs(page, size);
    }
}
