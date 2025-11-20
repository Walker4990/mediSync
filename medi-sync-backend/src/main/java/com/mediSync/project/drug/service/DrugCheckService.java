package com.mediSync.project.drug.service;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.mapper.DrugCheckMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DrugCheckService {

    private final DrugCheckMapper drugCheckMapper;

    public List<DrugCheckDTO> getNotCheckedDTO(){
        List<DrugCheckDTO> list = drugCheckMapper.getDrugCheckDTONotChecked();
        List<String>drugCode = drugCheckMapper.getDrugCodeByDrugCheck();
        Set<String> checkedSet = new HashSet<>(drugCode);

        for (DrugCheckDTO li: list){
            li.setIsChecked(checkedSet.contains(li.getDrugCode()));
        }
        return list;
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

}
