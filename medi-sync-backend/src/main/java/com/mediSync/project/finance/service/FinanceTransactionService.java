package com.mediSync.project.finance.service;


import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FinanceTransactionService {
    private final FinanceTransactionMapper financeTransactionMapper;

    public List<FinanceTransaction> selectAll(Map<String, Object> filters){
        return financeTransactionMapper.selectAll(filters);
    }
}
