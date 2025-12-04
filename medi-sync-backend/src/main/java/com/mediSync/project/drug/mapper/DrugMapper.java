package com.mediSync.project.drug.mapper;

import com.mediSync.project.drug.dto.DrugDTO;
import com.mediSync.project.drug.vo.Drug;
import com.mediSync.project.drug.vo.DrugPurchase;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

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
    int decreaseQuantityByInven(@Param("itemName") String itemName,
                                @Param("usedQty") double usedQty);
    List<DrugPurchase>getDrugPurchaseOrderByDate(String drugCode);
    int updateLotQuantity(Map<String, Object> params);
    int deleteLot(int purchaseId);
}
