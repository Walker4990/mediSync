package com.mediSync.project.drug.mapper;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DrugInOutMapper {
    int plusDrugInIut(DrugCheckDTO drug);
}
