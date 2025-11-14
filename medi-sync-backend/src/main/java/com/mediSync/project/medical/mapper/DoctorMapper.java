package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.dto.DoctorDTO;
import com.mediSync.project.medical.dto.DoctorInfoDTO;
import com.mediSync.project.medical.vo.AdminAccount;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface DoctorMapper {
    List<DoctorInfoDTO> doctorSelectAll();
    AdminAccount doctorSelectById(Long doctorId);
    void insertDoctor(AdminAccount doctor);
    void editDoctor(AdminAccount doctor);
    void delDoctor(Long doctorId);
    Map<String, Object> getConsultFeeByDoctorId(Long doctorId);

    //의사 서치
    List<DoctorInfoDTO> doctorSelectByDepartment(long dept_id);

    String findDepartmentByDoctorId(Long doctorId);

    DoctorDTO findDoctorByAdminId(long adminId);

}
