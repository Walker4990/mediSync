package com.mediSync.project.drug.mapper;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.vo.DrugCheckDetail;
import com.mediSync.project.drug.vo.DrugLog;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface DrugCheckMapper {
    List<DrugCheckDTO> getDrugCheckDTONotChecked();
    int getTotalQuantityByDrugCode(String drugCode);
    int registerInspection(DrugCheckDTO dto);
    int registerCheckDetail(Map<String, Object> param);
    List<String> getDrugCodeByDrugCheck();
    List<DrugCheckDTO>getCheckedDrug(long checkId);
    List<DrugCheckDTO>getAllCheckedDrug();
    DrugCheckDetail getDetailInfoByDetailId(long detailId);
    int updateDetailCheck(long detailId);
    String getDrugCodeByDetailId(long detailId);
    int updateDrugDispose(Map<String, Object> params);
    int insertDrugLog(DrugLog log);
}
