package com.mediSync.project.drug.mapper;

import com.mediSync.project.drug.dto.DrugCheckDTO;
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
}
