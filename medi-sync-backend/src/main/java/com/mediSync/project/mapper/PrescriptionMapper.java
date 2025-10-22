package com.mediSync.project.mapper;

import com.mediSync.project.vo.Prescription;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PrescriptionMapper {
    int insertPrescription(Prescription prescription);
    List<Prescription> selectPrescription();
    List<Prescription> selectPrescriptionByPatientId(Long recordId);

}
