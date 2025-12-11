package com.mediSync.project.drug.mapper;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.vo.DrugPurchase;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DrugInOutMapper {
    int plusDrugInIut(DrugPurchase drug);
    int insertDurgPurchase(DrugPurchase drug);
    List<String>getLotNo();
    List<String>getDrugCodes();
}
