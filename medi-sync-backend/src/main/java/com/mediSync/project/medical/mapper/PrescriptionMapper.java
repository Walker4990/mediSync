package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.vo.Prescription;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PrescriptionMapper {
    int insertPrescription(Prescription prescription);
    List<Prescription> selectPrescription();
    List<Prescription> selectPrescriptionByPatientId(Long recordId);

    List<Prescription> selectInpatientPrescriptions();

}
