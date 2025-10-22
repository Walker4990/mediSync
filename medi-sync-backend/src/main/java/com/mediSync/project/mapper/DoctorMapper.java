package com.mediSync.project.mapper;

import com.mediSync.project.vo.Doctor;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DoctorMapper {
    int insertDoctor(Doctor doctor);
    List<Doctor> doctorSelectAll();
    Doctor doctorSelectById(Long doctorId);
    void editDoctor(Doctor doctor);
    void delDoctor(int doctorId);
}
