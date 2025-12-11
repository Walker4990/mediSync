package com.mediSync.project.drug.service;

import com.mediSync.project.drug.dto.DrugDTO;
import com.mediSync.project.drug.dto.DrugPurchaseDTO;
import com.mediSync.project.drug.mapper.DrugCheckMapper;
import com.mediSync.project.drug.mapper.DrugMapper;
import com.mediSync.project.drug.vo.DrugLog;
import com.mediSync.project.insurance.mapper.InsurerMapper;
import com.mediSync.project.drug.vo.Drug;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DrugService {

    private final DrugMapper drugMapper;
    private final InsurerMapper insurerMapper;
    private final DrugCheckMapper drugCheckMapper;

    public int insertDrug(Drug drug) {
        int result =  drugMapper.insertDrug(drug);
        if ( result > 0 ) {
            drugMapper.insertInventoryItem(drug);
        }
        return result;
    }
    public List<DrugDTO> selectAllDrug() {
        return drugMapper.selectAllDrug();
    }

    public List<String>getInsuranceName(){
        return insurerMapper.selectAllInsuranceName();
    }
    public Drug selectDrugByDrugCode(String drugCode){
        return drugMapper.selectDrugByDrugCode(drugCode);
    }

    @Transactional
    public int editDrug(DrugPurchaseDTO drug) {

        //기존 정보 가져오기
        Drug origin = drugMapper.selectDrugByDrugCode(drug.getDrugCode());
        System.out.println("갱신할 약 정보 : "+ drug);
        System.out.println("기존 약 정보 : "+ origin);

        System.out.println("insurer code :" + drug.getInsuranceCode());
        //durg_purchase 수정
        Map<String, Object> params = new HashMap<>();
        params.put("purchaseId", drug.getPurchaseId());
        params.put("quantity",drug.getQuantity());
        drugCheckMapper.updateDrugPurchaseDispose(params);
        //drug 수정
        drugCheckMapper.updateDrugDispose(drug.getDrugCode());

        Drug newDrug = new Drug();

        int result = drugMapper.editDrug(newDrug);
        //만약 수량이 수정됐다면 로그 남기기
        if(drug.getQuantity() != origin.getQuantity()){
            DrugLog log = new DrugLog();
            //바뀐 개수
            int count;
            if(drug.getQuantity() > origin.getQuantity()){
                count = drug.getQuantity() - origin.getQuantity();
                System.out.println("증가"+ count);
                log.setType("IN");
            }
            else{
                count = origin.getQuantity()- drug.getQuantity();
                System.out.println("감소 : "+ count);
                log.setType("OUT");
            }
            //로그에 들어갈 정보 저장
            log.setDrugCode(drug.getDrugCode());
            log.setQuantity(count);
            log.setBeforeStock(origin.getQuantity());
            log.setAfterStock(drug.getQuantity());
            log.setMemo("불일치한 수량 조정");
            //로그에 저장
            drugCheckMapper.insertDrugLog(log);
        }


        return result;
    }
    @Transactional
    public int deleteDrug(String drugCode){
        int result = drugMapper.deleteDrug(drugCode);
        drugMapper.deleteDrugInventory(drugCode);
        return result;
    }
    // 약 자동 완성 검색
    public List<Drug> searchDrugsByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        return drugMapper.searchDrugsByKeyword(keyword.trim());
    }

    // 약 자동 완성 검색
    public List<Drug> searchDrugsByKeywordIncludeInjection(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        return drugMapper.searchDrugsByKeywordIncludeInjection(keyword.trim());
    }

    // 주사 자동 완성 검색
    public List<Drug> searchInjectionByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return List.of();
        return drugMapper.searchInjectionByKeyword(keyword.trim());
    }
    public Map<String, Object> getPagedDrugs (int page, int size){
        int offset = (page - 1) * size;


        List<Drug> list = drugMapper.selectPaged(offset, size);
        System.out.println("약 리스트 : "+ list);
        int totalCount = drugMapper.countAll();

        int totalPages = (int) Math.ceil((double)totalCount / size);

        Map<String, Object> map = new HashMap<>();
        map.put("items", list);
        map.put("totalPages", totalPages);
        return map;
    }
}
