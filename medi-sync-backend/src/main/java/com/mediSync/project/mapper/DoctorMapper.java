package com.mediSync.project.mapper;

import com.mediSync.project.vo.Doctor;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface DoctorMapper {
    List<Doctor> doctorSelectAll();
    Doctor doctorSelectById(Long doctorId);
    void insertDoctor(Doctor doctor);
    void editDoctor(Doctor doctor);
    void delDoctor(Long doctorId);
    Map<String, Object> getConsultFeeByDoctorId(Long doctorId);

}
