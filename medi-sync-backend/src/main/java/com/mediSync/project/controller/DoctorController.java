package com.mediSync.project.controller;

import com.mediSync.project.service.DoctorService;
import com.mediSync.project.vo.Doctor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctorService;

    @GetMapping
    public List<Doctor> selectDoctorAll() {
        return doctorService.selectAllDoctor();
    }
}
