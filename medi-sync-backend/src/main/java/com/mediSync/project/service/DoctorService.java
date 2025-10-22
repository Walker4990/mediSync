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

    public int insertDoctor(Doctor doctor){
        return doctorMapper.insertDoctor(doctor);
    }
    public List<Doctor> selectAllDoctor(){
        return doctorMapper.doctorSelectAll();
    }
    public Doctor selectDoctorById(Long doctorId){
        return doctorMapper.doctorSelectById(doctorId);
    }

    public void editDoctor(Doctor doctor) {
        doctorMapper.editDoctor(doctor);
    }

    public void delDoctor(int doctorId) {
        doctorMapper.delDoctor(doctorId);
    }
}




