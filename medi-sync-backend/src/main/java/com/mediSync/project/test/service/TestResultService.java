package com.mediSync.project.test.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;
import com.itextpdf.text.pdf.qrcode.WriterException;
import com.mediSync.project.test.dto.LisResultDTO;
import com.mediSync.project.test.mapper.TestReservationMapper;
import com.mediSync.project.test.mapper.TestResultMapper;
import com.mediSync.project.test.vo.TestResult;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TestResultService {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final TestResultMapper testResultMapper;
    private final TestReservationMapper testReservationMapper;

    public void processLisResult(LisResultDTO dto) {

        // 1️⃣ 결과 데이터가 없을 경우 자동 생성 (Mock)
        Map<String, String> mockData = dto.getMockData();

        if (mockData == null || mockData.isEmpty()) {
            // 프론트에서 안보냈을 때만 자동 생성
            mockData = generateMockLisData(dto.getTestCode());
        }

        // 2️⃣ DB에 결과 저장
        mockData.forEach((item, value) -> {
            TestResult result = new TestResult();
            result.setPatientId(dto.getPatientId());
            result.setAdminId(dto.getAdminId());
            result.setRecordId(dto.getRecordId());
            result.setTestCode(dto.getTestCode());
            result.setTestName(dto.getTestName());
            result.setTestArea(item);
            result.setResultValue(value);
            result.setStatus("COMPLETED");
            result.setTestDate(LocalDate.now());
            result.setCreatedAt(LocalDateTime.now());
            result.setUpdatedAt(LocalDateTime.now());
            testResultMapper.insertTestResult(result);
        });

        // 3️⃣ 예약 상태 업데이트
        if (dto.getReservationId() != null) {
            testReservationMapper.updateStatus(dto.getReservationId(), "COMPLETED");
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("patientId",  dto.getPatientId());
        payload.put("testName", dto.getTestName());
        payload.put("reservationId", dto.getReservationId());
        payload.put("patientName", dto.getPatientName());
        System.out.println("📤 Sending WebSocket Message: " + payload);
        // 검사 결과 실시간 전송
        messagingTemplate.convertAndSend("/topic/testResult", payload);
    }

    // ✅ Mock 결과 자동 생성 로직
    private Map<String, String> generateMockLisData(String testCode) {
        switch (testCode) {
            case "T001": // 혈액검사
                return Map.of(
                        "간수치(AST)", randomRange(20, 40) + " IU/L",
                        "혈소판", randomRange(150, 400) + " ×10³/μL",
                        "백혈구", randomRange(4000, 10000) + " /μL"
                );
            case "T004": // CT
                return Map.of("영상 판독 결과", "정상 소견 (이상 없음)");
            case "T008": // 위내시경
                return Map.of("위염 소견", "약간의 염증 관찰됨", "출혈", "없음");
            case "T009": // 알레르기 검사
                return Map.of("먼지 진드기", "음성", "꽃가루", "양성(중등도)");
            default:
                return Map.of("일반 검사 결과", "정상");
        }
    }

    private String randomRange(int min, int max) {
        return String.valueOf((int) (Math.random() * (max - min + 1)) + min);
    }

    public byte[] generateTestResultPdf(Long reservationId) {
        List<TestResult> results = testResultMapper.findByReservationId(reservationId);
        if (results == null || results.isEmpty()) {
            throw new IllegalArgumentException("해당 예약에 검사 결과가 없습니다.");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 60, 60, 60, 60);
            PdfWriter.getInstance(document, baos);
            document.open();

            // ✅ 한글 폰트 설정 (경로 확인)
            String fontPath;
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                fontPath = "C:/Windows/Fonts/malgun.ttf";
            } else {
                fontPath = "/usr/share/fonts/truetype/nanum/NanumGothic.ttf";
            }

            java.io.File fontFile = new java.io.File(fontPath);
            if (!fontFile.exists()) {
                System.out.println("⚠️ [경고] 지정한 폰트 파일을 찾을 수 없습니다: " + fontPath);
            } else {
                System.out.println("✅ 폰트 경로 확인됨: " + fontPath);
            }

            BaseFont baseFont = BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            Font labelFont = new Font(baseFont, 12, Font.BOLD);
            Font normalFont = new Font(baseFont, 11);

            // ✅ 헤더 (병원명, 로고, 날짜)
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{7, 3});
            headerTable.setSpacingAfter(20);

            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.addElement(new Paragraph("🩺 MediSync Medical Center",
                    new Font(baseFont, 14, Font.BOLD, new BaseColor(40, 60, 120))));
            Paragraph titleLine = new Paragraph("검사결과 리포트 (Laboratory Report)",
                    new Font(baseFont, 18, Font.BOLD));
            titleLine.setSpacingBefore(5);
            leftCell.addElement(titleLine);

            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            try {
                ClassPathResource resource = new ClassPathResource("static/images/logo.png");
                if (resource.exists()) {
                    Image logo = Image.getInstance(resource.getInputStream().readAllBytes());
                    logo.scaleToFit(60, 60);
                    rightCell.addElement(logo);
                } else {
                    System.out.println("⚠️ 로고 이미지가 존재하지 않습니다. 텍스트 로고로 대체합니다.");
                    rightCell.addElement(new Paragraph("MediSync",
                            new Font(baseFont, 12, Font.BOLD, new BaseColor(90, 90, 90))));
                }
            } catch (Exception e) {
                System.out.println("⚠️ 로고 로드 실패: " + e.getMessage());
                rightCell.addElement(new Paragraph("MediSync",
                        new Font(baseFont, 12, Font.BOLD, new BaseColor(90, 90, 90))));
            }

            rightCell.addElement(new Paragraph("발행일: " + LocalDate.now(), new Font(baseFont, 10)));
            headerTable.addCell(leftCell);
            headerTable.addCell(rightCell);
            document.add(headerTable);

            LineSeparator separator = new LineSeparator();
            separator.setLineColor(new BaseColor(60, 80, 150));
            separator.setLineWidth(1.5f);
            document.add(separator);
            document.add(new Paragraph("\n"));

            // ✅ 기본 정보
            TestResult first = results.get(0);
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(15);

            infoTable.addCell(makeInfoCell("환자명", labelFont));
            infoTable.addCell(makeInfoCell(first.getPatientName(), normalFont));
            infoTable.addCell(makeInfoCell("검사명", labelFont));
            infoTable.addCell(makeInfoCell(first.getTestName(), normalFont));
            infoTable.addCell(makeInfoCell("담당의", labelFont));
            infoTable.addCell(makeInfoCell(first.getDoctorName() != null ? first.getDoctorName() : "-", normalFont));
            infoTable.addCell(makeInfoCell("검사일자", labelFont));
            infoTable.addCell(makeInfoCell(first.getTestDate() != null ? first.getTestDate().toString() : "-", normalFont));
            infoTable.addCell(makeInfoCell("상태", labelFont));
            infoTable.addCell(makeInfoCell(first.getStatus() != null ? first.getStatus() : "-", normalFont));
            document.add(infoTable);

            // ✅ 결과 테이블
            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3, 3, 2});
            table.setSpacingBefore(10);
            table.setSpacingAfter(20);

            table.addCell(makeHeaderCell("검사항목", labelFont));
            table.addCell(makeHeaderCell("결과값", labelFont));
            table.addCell(makeHeaderCell("단위", labelFont));

            for (TestResult r : results) {
                table.addCell(makeDataCell(r.getTestArea(), normalFont));
                table.addCell(makeDataCell(r.getResultValue(), normalFont));
                table.addCell(makeDataCell(parseUnit(r.getTestArea()), normalFont));
            }
            document.add(table);

            // ✅ 판독 요약
            Paragraph summary = new Paragraph("판독 요약: No abnormal findings detected.", normalFont);
            summary.setSpacingBefore(10);
            document.add(summary);

            // ✅ QR 코드 삽입 (URL 인코딩 적용)
            String qrCodeUrl = java.net.URLEncoder.encode(
                    "https://medisync.kr/report/" + reservationId,
                    java.nio.charset.StandardCharsets.UTF_8
            );

            Image qrImage = generateQrCodeImage(qrCodeUrl);
            qrImage.scaleToFit(80, 80);
            qrImage.setAlignment(Element.ALIGN_RIGHT);
            document.add(qrImage);

            // ✅ 안내문
            Paragraph footer = new Paragraph(
                    "본 검사 결과는 MediSync 시스템을 통해 자동 생성된 공식 보고서이며, "
                            + "의료진의 판독 및 검증 절차를 거쳤습니다.\n"
                            + "※ 이 보고서는 진단 보조 목적으로만 사용되며, 임상적 판단은 담당의가 최종 확인합니다.\n"
                            + "────────────────────────────────────────────\n"
                            + "Generated by MediSync LIS System | Verified: YES | Version: v1.0",
                    new Font(baseFont, 9, Font.ITALIC, new BaseColor(80, 80, 80))
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(20);
            footer.setLeading(15f);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            e.printStackTrace(); // ❗콘솔에서 정확한 예외 확인용
            throw new RuntimeException("PDF 생성 실패: " + e.getClass().getSimpleName() + " - " + e.getMessage(), e);
        }
    }


    /** ====== 🔧 유틸 메서드들 ====== **/
    private PdfPCell makeInfoCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5);
        return cell;
    }

    private PdfPCell makeHeaderCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new BaseColor(240, 240, 240));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(7);
        return cell;
    }

    private PdfPCell makeDataCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        return cell;
    }

    private String parseUnit(String item) {
        if (item == null) return "";
        item = item.toLowerCase();
        if (item.contains("volume")) return "cm³";
        if (item.contains("velocity")) return "cm/s";
        if (item.contains("intensity")) return "-";
        return "";
    }

    // ✅ QR 코드 생성 (zxing)
    private Image generateQrCodeImage(String text) throws WriterException, IOException, BadElementException, com.google.zxing.WriterException {
        QRCodeWriter qrWriter = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1); // 기본 여백 줄이기
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        BitMatrix bitMatrix = qrWriter.encode(text, BarcodeFormat.QR_CODE, 150, 150, hints);
        BufferedImage bufferedImage = new BufferedImage(150, 150, BufferedImage.TYPE_INT_RGB);

        for (int x = 0; x < 150; x++) {
            for (int y = 0; y < 150; y++) {
                bufferedImage.setRGB(x, y, bitMatrix.get(x, y) ? 0x000000 : 0xFFFFFF);
            }
        }

        ByteArrayOutputStream pngOutput = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "png", pngOutput);
        return Image.getInstance(pngOutput.toByteArray());
    }


}

