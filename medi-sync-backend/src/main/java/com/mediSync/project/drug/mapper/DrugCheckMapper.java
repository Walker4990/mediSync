package com.mediSync.project.drug.mapper;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.dto.DrugLogDTO;
import com.mediSync.project.drug.vo.DrugCheckDetail;
import com.mediSync.project.drug.vo.DrugLog;
import com.mediSync.project.drug.vo.DrugPurchase;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface DrugCheckMapper {
    List<DrugCheckDTO> getDrugCheckDTOAll();
    List<DrugCheckDTO> getDrugCheckDTONotChecked();
    int getTotalQuantityByDrugCode(String drugCode);
    int registerInspection(DrugCheckDTO dto);
    int registerCheckDetail(Map<String, Object> param);
    List<String> getDrugCodeByDrugCheck();
    List<DrugCheckDTO>getCheckedDrug(long purchaseId);
    List<DrugCheckDTO>getAllCheckedDrug();
    DrugCheckDetail getDetailInfoByDetailId(long detailId);
    int updateDetailCheck(long detailId);
    String getDrugCodeByDetailId(long detailId);
    int updateDrugDispose(String drugCode);
    int updateDrugPurchaseDispose(Map<String, Object> params);
    int insertDrugLog(DrugLog log);
    List<DrugLogDTO> getDrugLog(Map<String,Object> params);
    List<DrugPurchase>getAllDrugLocation(String drugCode);
    DrugPurchase getPurchaseInfoByPurchaseId(int purchaseId);
    int deleteDrugPurchase(int purchase_id);
}
