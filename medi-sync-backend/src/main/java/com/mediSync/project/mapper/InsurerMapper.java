package com.mediSync.project.mapper;

import com.mediSync.project.vo.Drug;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface InsurerMapper {
    int updateInsurer(Drug drug);
}
