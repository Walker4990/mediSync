package com.mediSync.project.drug.service;

import com.mediSync.project.drug.dto.DrugDTO;
import com.mediSync.project.drug.mapper.DrugMapper;
import com.mediSync.project.insurance.mapper.InsurerMapper;
import com.mediSync.project.drug.vo.Drug;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DrugService {

    private final DrugMapper drugMapper;
    private final InsurerMapper insurerMapper;
    public int insertDrug(Drug drug) {
        int result =  drugMapper.insertDrug(drug);
        if ( result > 0 ) {
            drugMapper.insertInventoryItem(drug);
        }
        return result;
    }
    public List<DrugDTO> selectAllDrug() {
        return drugMapper.selectAllDrug();
    }
    public Drug selectDrugByDrugCode(String drugCode){
        return drugMapper.selectDrugByDrugCode(drugCode);
    }

    @Transactional
    public int editDrug(Drug drug) {
        int result = drugMapper.editDrug(drug);

        // ✅ 재고 정보도 함께 수정
        drugMapper.updateInventoryItem(drug);

        // ✅ 보험사 코드가 변경된 경우 보험사도 수정
        if (drug.getInsurerCode() != null) {
            insurerMapper.updateInsurer(drug);
        }

        return result;
    }
    @Transactional
    public int deleteDrug(String drugCode){
        int result = drugMapper.deleteDrug(drugCode);
        drugMapper.deleteDrugInventory(drugCode);
        return result;
    }
    // 약 자동 완성 검색
    public List<Drug> searchDrugsByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        return drugMapper.searchDrugsByKeyword(keyword.trim());
    }
    // 주사 자동 완성 검색
    public List<Drug> searchInjectionByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return List.of();
        return drugMapper.searchInjectionByKeyword(keyword.trim());
    }
}
