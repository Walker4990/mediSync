package com.mediSync.project.insurance.mapper;

import com.mediSync.project.drug.vo.Drug;
import com.mediSync.project.insurance.vo.Insurer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface InsurerMapper {
    int updateInsurer(Drug drug);

    int upsertInsurer(@Param("code") String code,
                      @Param("name") String name,
                      @Param("endpoint") String endpoint,
                      @Param("contact") String contact
    );
    List<Map<String, Object>> findAll();

    List<Insurer> getInsurerCode();
}
