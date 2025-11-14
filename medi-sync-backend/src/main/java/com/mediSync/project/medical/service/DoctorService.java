package com.mediSync.project.medical.service;

import com.mediSync.project.medical.dto.DoctorDTO;
import com.mediSync.project.medical.dto.DoctorInfoDTO;
import com.mediSync.project.medical.mapper.DoctorMapper;
import com.mediSync.project.medical.vo.AdminAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorMapper doctorMapper;

    public List<DoctorInfoDTO> selectAllDoctor(){
        return doctorMapper.doctorSelectAll();
    }
    public AdminAccount selectDoctorById(Long doctorId){
        return doctorMapper.doctorSelectById(doctorId);
    }
    public void insertDoctor(AdminAccount doctor){ doctorMapper.insertDoctor(doctor);
    }
    public void editDoctor(AdminAccount doctor) {
        doctorMapper.editDoctor(doctor);
    }
    public void delDoctor(Long doctorId) {
        doctorMapper.delDoctor(doctorId);
    }
    public Map<String, Object> getConsultFeeByDoctorId(Long doctorId) {
        return doctorMapper.getConsultFeeByDoctorId(doctorId);
    }
    //의사 서치
    public List<DoctorInfoDTO> selectDoctorByDepartment(long dept_id){
        return doctorMapper.doctorSelectByDepartment(dept_id);
    }

    public DoctorDTO findDoctorByAdminId(long adminId){
        return doctorMapper.findDoctorByAdminId(adminId);
    }

}




