package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.vo.AdminAccount;
import com.mediSync.project.medical.vo.Doctor;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface DoctorMapper {
    List<AdminAccount> doctorSelectAll();
    Doctor doctorSelectById(Long doctorId);
    void insertDoctor(Doctor doctor);
    void editDoctor(Doctor doctor);
    void delDoctor(Long doctorId);
    Map<String, Object> getConsultFeeByDoctorId(Long doctorId);

    //의사 서치
    List<AdminAccount> doctorSelectByDepartment(long dept_id);

    String findDepartmentByDoctorId(Long doctorId);
}
