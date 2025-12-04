package com.mediSync.project.medical.service;

import com.mediSync.project.medical.mapper.MedicalRecordMapper;
import com.mediSync.project.medical.mapper.PrescriptionMapper;
import com.mediSync.project.medical.vo.MedicalRecord;
import com.mediSync.project.medical.vo.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionMapper prescriptionMapper;
    private final MedicalRecordMapper medicalRecordMapper;

    public int insertPrescription(Prescription prescription) {
        return prescriptionMapper.insertPrescription(prescription);
    }

    public List<Prescription> selectPrescriptions() {
        return prescriptionMapper.selectPrescription();
    }

    public List<Prescription> selectPrescriptionsById(Long recordId) {
        return prescriptionMapper.selectPrescriptionByPatientId(recordId);
    }

    public byte[] generatePrescriptionPdf(Long recordId) {
        MedicalRecord record = medicalRecordMapper.selectRecordById(recordId);
        List<Prescription> prescriptions = prescriptionMapper.selectPrescriptionByPatientId(recordId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            PdfContentByte canvas = writer.getDirectContentUnder();
            Image bg = Image.getInstance(
                    new ClassPathResource("static/images/prescription_bg.png")
                            .getInputStream()
                            .readAllBytes()
            );
            bg.scaleAbsolute(PageSize.A4.getWidth(), PageSize.A4.getHeight());
            bg.setAbsolutePosition(0, 0);
            canvas.addImage(bg);

            PdfContentByte text = writer.getDirectContent();
            BaseFont bf = BaseFont.createFont("C:/Windows/Fonts/malgun.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            Font font = new Font(bf, 10);
            float h = PageSize.A4.getHeight();

            // ───────────── 상단 ─────────────
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase(record.getPatientName(), font), 238, h - 194, 0); // 환자명
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase("900101-*******", font), 215, h - 221, 0); // 주민번호 표시
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase("MediSync", font), 458, h - 168, 0); // 의사명
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase("02-1234-1234", font), 445, h - 188, 0); // 병원 전화번호
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase(record.getDoctorName(), font), 237, h - 257, 0); // 의사명

            // ✅ 서명 이미지 삽입 (의사 서명)
            Image signature = Image.getInstance(
                    new ClassPathResource("static/images/signature.png").getInputStream().readAllBytes()
            );
            signature.scaleAbsolute(70, 40);
            signature.setAbsolutePosition(337, h - 277); // 하단 "의사명(서명)" 위치 근처
            writer.getDirectContent().addImage(signature); // 텍스트 위에 표시

            // ───────────── 약품 목록 ─────────────
            int y = (int) (h - 340);

            for (Prescription p : prescriptions) {

                // 🔥 약(DRUG)만 처방전에 포함
                if (!"DRUG".equalsIgnoreCase(p.getType())) continue;

                ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase(p.getDrugName(), font), 111, y, 0);
                ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase(String.valueOf(p.getDosage())+ "알", font), 276, y, 0);
                ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase("3회", font), 330, y, 0);
                ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase(String.valueOf(p.getDuration()), font), 385, y, 0);
                ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase("식후 30분", font), 460, y, 0);

                y -= 18;
            }

            // ───────────── 하단 ─────────────
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT,
                    new Phrase("조제 시 참고사항: 특별사항 없음", font), 120, h - 820, 0);
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT,
                    new Phrase(record.getDoctorName() + " (서명)", font), 120, h - 845, 0);
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT,
                    new Phrase(LocalDate.now().toString(), font), 440, h - 845, 0);

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF 생성 중 오류", e);
        }
    }

    public List<Prescription> selectInpatientPrescriptions() {
        return prescriptionMapper.selectInpatientPrescriptions();
    }


}

