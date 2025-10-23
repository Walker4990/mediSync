package com.mediSync.project.mapper;

import com.mediSync.project.dto.DrugDTO;
import com.mediSync.project.vo.Drug;
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
    List<Drug> searchDrugsByKeyword(@Param("keyword") String keyword);

}
