package com.mediSync.project.service;

import com.mediSync.project.mapper.DoctorMapper;
import com.mediSync.project.vo.Doctor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorMapper doctorMapper;

    public List<Doctor> selectAllDoctor(){
        return doctorMapper.doctorSelectAll();
    }
    public Doctor selectDoctorById(Long doctorId){
        return doctorMapper.doctorSelectById(doctorId);
    }
    public void insertDoctor(Doctor doctor){ doctorMapper.insertDoctor(doctor);
    }
    public void editDoctor(Doctor doctor) {
        doctorMapper.editDoctor(doctor);
    }
    public void delDoctor(Long doctorId) {
        doctorMapper.delDoctor(doctorId);
    }
}




