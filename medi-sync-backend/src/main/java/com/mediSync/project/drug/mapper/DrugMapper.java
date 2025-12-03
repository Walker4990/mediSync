package com.mediSync.project.drug.mapper;

import com.mediSync.project.drug.dto.DrugDTO;
import com.mediSync.project.drug.vo.Drug;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DrugMapper {
    int insertDrug(Drug drug);
    List<DrugDTO> selectAllDrug();
    Drug selectDrugByDrugCode(String drugCode);
    int insertInventoryItem(Drug drug);
    int editDrug(Drug drug);
    void updateInventoryItem(Drug drug);
    int deleteDrug(String drugCode);
    int deleteDrugInventory(String drugCode);
    // 자동완성 검색 (약품명/코드)
    List<Drug>searchDrugsByKeywordIncludeInjection(@Param("keyword") String keyword);
    List<Drug> searchDrugsByKeyword(@Param("keyword") String keyword);
    List<Drug> searchInjectionByKeyword(@Param("keyword") String Keyword);

    int countAll();
    List<Drug> selectPaged(int offset, int size);
}
