package com.mediSync.project.finance.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;

@Mapper
public interface BillingMapper {
    int upsertByRecordId(@Param("recordId") Long recordId,
                         @Param("totalAmount") BigDecimal totalAmount,
                         @Param("discount") BigDecimal discount,
                         @Param("status") String status);
}
