package com.mediSync.project.mapper;

import com.mediSync.project.vo.FinanceTransaction;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FinanceTransactionMapper {
    int insertFinance(FinanceTransaction ft);
}
