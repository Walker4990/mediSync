package com.mediSync.project.drug.service;

import com.mediSync.project.drug.dto.DrugCheckDTO;
import com.mediSync.project.drug.mapper.DrugCheckMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DrugCheckService {

    private final DrugCheckMapper drugCheckMapper;

    public List<DrugCheckDTO> getNotCheckedDTO(){
        return drugCheckMapper.getDrugCheckDTONotChecked();
    }

    public int registerInspection(DrugCheckDTO dto){

        int realInventoryQty = drugCheckMapper.getTotalQuantityByDrugCode(dto.getDrugCode());

        int totalChecked = dto.getInspections()
                .stream()
                .mapToInt(DrugCheckDTO.Detail::getQuantity)
                .sum();

        if (totalChecked > realInventoryQty) {
            System.out.println("검사 수량이 총 재고보다 많습니다.");
            throw new IllegalArgumentException("검사 수량이 총 재고보다 많습니다.");
        }




        return drugCheckMapper.registerInspection(dto);
    }

}
