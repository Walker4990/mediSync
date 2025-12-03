package com.mediSync.project.drug.controller;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.dto.DrugDTO;
import com.mediSync.project.drug.service.DrugInOutService;
import com.mediSync.project.drug.service.DrugService;
import com.mediSync.project.drug.vo.Drug;
import com.mediSync.project.drug.vo.DrugCheck;
import com.mediSync.project.drug.vo.DrugPurchase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inout")
@RequiredArgsConstructor
public class DrugInOutContoller {

    private final DrugService drugService;
    private  final DrugInOutService drugInOutService;

    @GetMapping
    public List<DrugDTO> getDrugInfo(){
        return drugService.selectAllDrug();
    }
    @GetMapping("/search/{keyword}")
    public List<Drug> getDrugInfoByKeyword(@PathVariable String keyword){
        return drugService.searchDrugsByKeywordIncludeInjection(keyword);
    }

    @GetMapping("/lotNo")
    public List<String> getLotNo(){
        return drugInOutService.getLotNo();
    }

    @GetMapping("/drugCode")
    public List<String>getDrugCodes(){
        return drugInOutService.getDrugCodes();
    }

    @GetMapping("/insurance")
    public List<String>getInsuranceName(){
        return drugService.getInsuranceName();
    }

    @PostMapping("/insert")
    public int insertDrugInfo(@RequestBody DrugPurchase drug){

        System.out.println("약 정보 : "+drug);
        int res = drugInOutService.plusDrugInIut(drug);
        return res;
    }

    @PostMapping("/new")
    public int insertDrugInfoAndPurchase(@RequestBody DrugDTO drug){
        System.out.println("들어온 약 정보 : "+ drug);
        drugInOutService.insertDrugInfoAndPurchase(drug);
        return 0;
    }


}
