package com.mediSync.project.controller;

import com.mediSync.project.service.PrescriptionService;
import com.mediSync.project.vo.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @GetMapping
    public List<Prescription> selectPrescriptions(){
        return prescriptionService.selectPrescriptions();
    }
    @GetMapping("/{recordId}")
    public List<Prescription> selectPrescriptionsByPatientId(@PathVariable Long recordId){
        return prescriptionService.selectPrescriptionsById(recordId);
    }
    @PostMapping("/add")
    public String insertPrescription(@RequestBody Prescription prescription){
        prescriptionService.insertPrescription(prescription);
        return "success";
    }
    @GetMapping("/pdf/{recordId}")
    public ResponseEntity<byte[]> generatePrescriptionPdf(@PathVariable Long recordId){
        byte[] pdfBytes = prescriptionService.generatePrescriptionPdf(recordId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "prescription_" + recordId + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
