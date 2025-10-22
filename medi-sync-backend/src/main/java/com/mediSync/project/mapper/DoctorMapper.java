package com.mediSync.project.mapper;

import com.mediSync.project.vo.Doctor;

import java.util.List;

public interface DoctorMapper {
    List<Doctor> allDoctor();
    void addDoctor(Doctor doctor);
    void editDoctor(Doctor doctor);
    void delDoctor(int doctorId);
}
