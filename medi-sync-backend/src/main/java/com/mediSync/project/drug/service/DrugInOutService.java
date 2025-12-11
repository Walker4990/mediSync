package com.mediSync.project.drug.service;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.dto.DrugDTO;
import com.mediSync.project.drug.mapper.DrugCheckMapper;
import com.mediSync.project.drug.mapper.DrugInOutMapper;
import com.mediSync.project.drug.mapper.DrugMapper;
import com.mediSync.project.drug.vo.Drug;
import com.mediSync.project.drug.vo.DrugLog;
import com.mediSync.project.drug.vo.DrugPurchase;
import com.mediSync.project.insurance.mapper.InsurerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class DrugInOutService {
    private final DrugInOutMapper drugInOutMapper;
    private  final DrugCheckMapper drugCheckMapper;
    private final DrugMapper drugMapper;
    private final InsurerMapper insurerMapper;
    public List<String> getLotNo(){
        List<String>list =drugInOutMapper.getLotNo();
        System.out.println("lotNo 정보 : "+ list);
        return list;
    }

    public List<String> getDrugCodes(){
     List<String> list = drugInOutMapper.getDrugCodes();
     System.out.println("Code 정보 : "+ list);
     return list;
    }

    @Transactional
    public int plusDrugInIut(DrugPurchase drug){
        //기존 정보 가져오기
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

        //재고 정보 테이블 생성
        drugInOutMapper.insertDurgPurchase(drug);

        //로그 작성
        drugCheckMapper.insertDrugLog(log);
        return 0;
    }


    @Transactional
    public int insertDrugInfoAndPurchase(DrugDTO drug){
        String insurerName = insurerMapper.selectAllInsuranceCodeByName(drug.getInsuranceCode());

        //drug 테이블에 새로 등록
        Drug newDurg = new Drug();
        newDurg.setDrugCode(drug.getDrugCode());
        newDurg.setDrugName(drug.getDrugName());
        newDurg.setLocation(drug.getLocation());
        newDurg.setQuantity(drug.getQuantity());
        newDurg.setUnitPrice(drug.getUnitPrice());
        newDurg.setUnit(drug.getUnit());
        newDurg.setExpirationDate(drug.getExpirationDate());
        newDurg.setInsuranceCode(insurerName);
        newDurg.setSupplier(drug.getSupplier());

        drugMapper.insertDrug(newDurg);

        //drug_purchase 테이블에 새로 등록
        DrugPurchase pur = new DrugPurchase();
        pur.setDrugCode(drug.getDrugCode());
        pur.setMemo("새 약품 등록");
        pur.setQuantity(drug.getQuantity());
        pur.setLocation(drug.getLocation());
        pur.setLotNo(drug.getLotNo());
        pur.setPurchasePrice(drug.getPurchasePrice().intValue());
        pur.setExpirationDate(drug.getExpirationDate());


        drugInOutMapper.insertDurgPurchase(pur);
        //drug_log에 새로 등록

        DrugLog log = new DrugLog();
        log.setDrugCode(drug.getDrugCode());
        log.setMemo("새 약품 등록");
        log.setType("IN");
        log.setQuantity(drug.getQuantity());
        log.setBeforeStock(0);
        log.setAfterStock(drug.getQuantity());
        //로그 작성
        drugCheckMapper.insertDrugLog(log);

        return 0;
    }
}
