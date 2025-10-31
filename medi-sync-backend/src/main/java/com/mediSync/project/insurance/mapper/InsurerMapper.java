package com.mediSync.project.insurance.mapper;

import com.mediSync.project.drug.vo.Drug;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface InsurerMapper {
    int updateInsurer(Drug drug);
}
