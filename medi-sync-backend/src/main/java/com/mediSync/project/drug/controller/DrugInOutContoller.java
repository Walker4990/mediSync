package com.mediSync.project.drug.controller;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.dto.DrugDTO;
import com.mediSync.project.drug.service.DrugInOutService;
import com.mediSync.project.drug.service.DrugService;
import com.mediSync.project.drug.vo.Drug;
import com.mediSync.project.drug.vo.DrugCheck;
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
        return drugService.searchDrugsByKeyword(keyword);
    }

    @PostMapping("/insert")
    public int insertDrugInfo(@RequestBody DrugCheckDTO drug){

        return drugInOutService.plusDrugInIut(drug);
    }
}
