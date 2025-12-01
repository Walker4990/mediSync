package com.mediSync.project.drug.service;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.mapper.DrugCheckMapper;
import com.mediSync.project.drug.mapper.DrugInOutMapper;
import com.mediSync.project.drug.mapper.DrugMapper;
import com.mediSync.project.drug.vo.Drug;
import com.mediSync.project.drug.vo.DrugLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class DrugInOutService {
    private final DrugInOutMapper drugInOutMapper;
    private  final DrugCheckMapper drugCheckMapper;
    private final DrugMapper drugMapper;


    @Transactional
    public int plusDrugInIut(DrugCheckDTO drug){
        //기존 개수 가져오기
        Drug origin = drugMapper.selectDrugByDrugCode(drug.getDrugCode());

        //로그 등록

        DrugLog log = new DrugLog();
        log.setDrugCode(drug.getDrugCode());
        log.setMemo(drug.getMemo());
        log.setType("IN");
        log.setQuantity(drug.getQuantity());
        log.setBeforeStock(origin.getQuantity());
        log.setAfterStock(drug.getQuantity());

        //수량 업데이트
        drugInOutMapper.plusDrugInIut(drug);


        drugCheckMapper.insertDrugLog(log);
        return 0;
    }
}
