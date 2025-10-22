package com.mediSync.project.service;

import com.mediSync.project.mapper.MedicalRecordMapper;
import com.mediSync.project.mapper.PrescriptionMapper;
import com.mediSync.project.vo.MedicalRecord;
import com.mediSync.project.vo.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.stream.Stream;

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
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase(record.getPatientName(), font), 240, h - 195, 0); // 환자명
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase("900101-*******", font), 210, h - 220, 0); // ✅ 전화번호 칸 → 주민번호 표시
            ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase(record.getDoctorName(), font), 465, h - 167, 0); // 의사명



            // ───────────── 약품 목록 ─────────────
            int y = (int) (h - 340); // 전체 ↓35
            for (Prescription p : prescriptions) {
                ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase(p.getDrugName(), font), 110, y, 0);
                ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase(p.getDosage(), font), 275, y, 0);
                ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase("3회", font), 330, y, 0);
                ColumnText.showTextAligned(text, Element.ALIGN_LEFT, new Phrase(p.getDuration(), font), 385, y, 0);
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



}

