package com.mediSync.project.drug.service;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.dto.DrugLogDTO;
import com.mediSync.project.drug.mapper.DrugCheckMapper;
import com.mediSync.project.drug.vo.DrugCheckDetail;
import com.mediSync.project.drug.vo.DrugLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrugCheckService {

    private final DrugCheckMapper drugCheckMapper;

    public List<DrugCheckDTO> getNotCheckedDTO(){
        List<DrugCheckDTO> list = drugCheckMapper.getDrugCheckDTONotChecked();
        List<String>drugCode = drugCheckMapper.getDrugCodeByDrugCheck();


        Set<String> checkedSet = new HashSet<>(drugCode);

         return list.stream()
                .filter(d -> !checkedSet.contains(d.getDrugCode()))
                .collect(Collectors.toList());
    }

    @Transactional
    public int registerInspection(DrugCheckDTO dto){
        int count = 0;
        for(DrugCheckDTO.Detail d : dto.getInspections()){
            count += d.getQuantity();
        }
        dto.setTotalQuantity(count);
        drugCheckMapper.registerInspection(dto);
        long checkId = dto.getCheckId();
        for(DrugCheckDTO.Detail d: dto.getInspections()){
            Map<String,Object> param = new HashMap<>();
            param.put("checkId", checkId);
            param.put("status",d.getStatus());
            param.put("quantity", d.getQuantity());
            param.put("note",d.getNote());

            int res = drugCheckMapper.registerCheckDetail(param);
        }
        return 0;
    }
    public List<DrugCheckDTO>getCheckedDrug(long checkId){
        return drugCheckMapper.getCheckedDrug(checkId);
    }

    public List<DrugCheckDTO>getAllCheckedDrug(){
        return drugCheckMapper.getAllCheckedDrug();
    }

    @Transactional
    public int updateDrugDispose(long detailId, int quantity){
        System.out.println("아이디 : " + detailId + "수량 : " + quantity);


        //업데이트 (drug_check >> is_checked를 'CHECK'로 변경)
        int res= drugCheckMapper.updateDetailCheck(detailId);

        //String 으로 코드 찾기
        String code = drugCheckMapper.getDrugCodeByDetailId(detailId);

        DrugLog log = new DrugLog();

        //기존 개수 가져오기
        int origin = drugCheckMapper.getTotalQuantityByDrugCode(code);
        System.out.println("기존 개수 : " + origin);

        log.setBeforeStock(origin);
        log.setAfterStock(origin - quantity);
        log.setQuantity(quantity);
        log.setMemo("약품 검사 미달");
        log.setDrugCode(code);
        log.setType("DISPOSE");
        //개수 변경
        Map<String,Object> params = new HashMap<>();
        params.put("drugCode", code);   // String
        params.put("quantity", quantity);   // int

        int res1 = drugCheckMapper.updateDrugDispose(params);
        System.out.println("변경 결과 : "+ res1);

        //로그 남기기
        int res2 = drugCheckMapper.insertDrugLog(log);
        System.out.println("로그 생성 결과 : "+ res2);
       return 0;
    }

    public int updateCheck(long detailId){
        int res= drugCheckMapper.updateDetailCheck(detailId);
        return res;
    }

    @Transactional
    public int updateinspectionDrugByDrugCode(String drugCode, int quantity, String memo){

        Map<String,Object> params = new HashMap<>();
        params.put("drugCode", drugCode);   // String
        params.put("quantity", quantity);   // int

        DrugLog log = new DrugLog();

        //기존 개수 가져오기
        int origin = drugCheckMapper.getTotalQuantityByDrugCode(drugCode);

        log.setBeforeStock(origin);
        log.setAfterStock(origin - quantity);
        log.setQuantity(quantity);
        log.setMemo(memo);
        log.setDrugCode(drugCode);
        log.setType("DISPOSE");
        //폐기하기
        drugCheckMapper.updateDrugDispose(params);
        //로그 남기기
        int res2 = drugCheckMapper.insertDrugLog(log);
        System.out.println("로그 생성 결과 : "+ res2);
        return 0;
    }

    public List<DrugLogDTO> getDrugLog(String sort, String drugCode){
        if (drugCode != null && drugCode.trim().isEmpty()) {
            drugCode = null;
        }
        Map<String,Object> params = new HashMap<>();
        params.put("sort", sort);

        params.put("drugCode", drugCode);
        return drugCheckMapper.getDrugLog(params);

    }

}
