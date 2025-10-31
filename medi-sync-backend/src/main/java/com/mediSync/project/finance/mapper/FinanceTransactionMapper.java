package com.mediSync.project.finance.mapper;

import com.mediSync.project.finance.vo.FinanceTransaction;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FinanceTransactionMapper {
    int insertFinance(FinanceTransaction ft);
}
