package com.mediSync.project.operation.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;
import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
import com.mediSync.project.medical.mapper.DoctorMapper;
import com.mediSync.project.medical.vo.AdminAccount;
import com.mediSync.project.operation.mapper.OperationMapper;
import com.mediSync.project.operation.vo.Operation;
import com.mediSync.project.operation.vo.OperationLog;
import com.mediSync.project.operation.vo.OperationRoom;
import com.mediSync.project.operation.vo.OperationStaff;
import com.mediSync.project.patient.mapper.PatientMapper;
import com.mediSync.project.patient.vo.Patient;
import com.mediSync.project.room.mapper.AdmissionHistoryMapper;
import com.mediSync.project.room.mapper.AdmissionMapper;
import com.mediSync.project.room.mapper.RoomMapper;
import com.mediSync.project.room.vo.Admission;
import com.mediSync.project.room.vo.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OperationService {

    private final OperationMapper operationMapper;
    private final PatientMapper patientMapper;
    private final DoctorMapper doctorMapper;
    private final FinanceTransactionMapper financeTransactionMapper;
    private final RoomMapper roomMapper;
    private final AdmissionMapper admissionMapper;
    private final AdmissionHistoryMapper admissionHistoryMapper;
    private final SimpMessagingTemplate messagingTemplate;
    @Transactional
    public boolean reserveOperation(Operation operation) {
        //  날짜, 시간 필수값 확인
        if (operation.getScheduledDate() == null || operation.getScheduledTime() == null) {
            throw new IllegalArgumentException("수술 날짜 및 시간이 지정되지 않았습니다.");
        }

        //  날짜+시간 기준으로 사용 가능한 수술실 조회
        List<OperationRoom> availableRooms = operationMapper.selectAvailableRooms(
                operation.getScheduledDate(),
                operation.getScheduledTime()
        );
        if (availableRooms.isEmpty()) {
            throw new IllegalStateException("해당 시간대에 사용 가능한 수술실이 없습니다.");
        }

        //  랜덤 수술실 배정
        OperationRoom selectedRoom = availableRooms.get(new Random().nextInt(availableRooms.size()));
        operation.setRoomId(selectedRoom.getRoomId());

        //  중복 예약 체크 (날짜+시간 기준)
        int conflict = operationMapper.checkScheduleConflict(
                operation.getRoomId(),
                operation.getScheduledDate(),
                operation.getScheduledTime()
        );
        if (conflict > 0) {
            throw new IllegalStateException("이미 예약된 시간입니다.");
        }

        //  수술 예약 등록 (당일 진행 아님)
        int inserted = operationMapper.insertOperation(operation);
        if (inserted <= 0) return false;

        //  수술 전날 입원 예약 로직
        LocalDate admissionDate = operation.getScheduledDate().minusDays(1);
        String department = doctorMapper.findDepartmentByDoctorId(operation.getAdminId());
        List<Room> availableRoom = roomMapper.findAvailableRooms(department);
        if (availableRoom.isEmpty()) {
            throw new IllegalStateException(department + " 병실에 공실이 없습니다.");
        }

        //  랜덤 병실 선택
        Room selectedRoomForAdmission = availableRoom.get(new Random().nextInt(availableRoom.size()));

        //  입원 “예약”으로 등록 (상태: SCHEDULED)
        Admission admission = new Admission();
        admission.setPatientId(operation.getPatientId());
        admission.setOperationId(operation.getOperationId());
        admission.setRoomId(selectedRoomForAdmission.getRoomId());
        admission.setAdmittedAt(admissionDate);

        admissionMapper.insertAdmission(admission);

        roomMapper.incrementRoomCount(selectedRoomForAdmission.getRoomId());

        //  알림 전송 (수술 전날 입원 예정)
        Patient patient = patientMapper.getPatientDetail(operation.getPatientId());
        Map<String, Object> payload = Map.of(
                "event", "ADMISSION_RESERVED",
                "patientId", patient.getPatientId(),
                "patientName", patient.getName(),
                "roomNo", selectedRoomForAdmission.getRoomNo(),
                "admissionDate", admissionDate.toString()
        );
        messagingTemplate.convertAndSend("/topic/admission/update", payload);

        return true;
    }



    public List<Operation> selectOperationList() {
        return operationMapper.selectOperationList();
    }

    public Operation getOperationById(Long operationId) {
        return operationMapper.getOperationById(operationId);
    }
    public int updateOperationStatus(Long operationId, String status) {
        return operationMapper.updateOperationStatus(operationId, status);
    }


    // ✅ 예약 가능 여부 조회
    public boolean isAvailable(LocalDate scheduledDate, LocalTime scheduledTime, int roomId) {
        int count = operationMapper.checkScheduleConflict((long) roomId, scheduledDate, scheduledTime);
        return count == 0; // 0이면 예약 가능
    }

    @Transactional
    public void updateOperation(Operation operation) {
        operationMapper.updateOperation(operation);

        OperationLog log = new OperationLog();
        log.setOperationId(operation.getOperationId());
        log.setAction("수술 정보 수정");
        log.setUserName("관리자");
        operationMapper.insertOperationLog(log);
    }

    @Transactional
    public void addStaff(OperationStaff staff) {

        int duplicate = operationMapper.checkDuplicateStaff(staff.getOperationId(), staff.getAdminId());
        if (duplicate > 0) {
            throw new IllegalStateException("이미 등록된 의료진입니다.");
        }
        operationMapper.insertOperationStaff(staff);

        OperationLog log = new OperationLog();
        log.setOperationId(staff.getOperationId());
        log.setAction("의료진 추가: " + staff.getName() + " (" + staff.getPosition() + ")");
        log.setUserName("관리자");
        operationMapper.insertOperationLog(log);
    }

    public List<OperationStaff> getStaffList(Long operationId) {
        return operationMapper.selectOperationStaffList(operationId);
    }

    public List<OperationLog> getOperationLogs(Long operationId) {
        return operationMapper.selectOperationLogs(operationId);
    }
    public List<OperationRoom> selectOperationRoomList(){
        return operationMapper.selectOperationRoomList();
    }
    public List<AdminAccount> selectStaffByOperationId(Long operationId) {
        return operationMapper.selectStaffByOperationId(operationId);
    }
    @Transactional
    public void deleteOperationStaff(Long operationId, Long staffId) {
        int result = operationMapper.deleteOperationStaff(operationId, staffId);
        if (result == 0) {
            throw new IllegalArgumentException("삭제 대상이 존재하지 않습니다.");
        }
        OperationLog log = new OperationLog();
        log.setOperationId(operationId);
        log.setAction("의료진 삭제");
        log.setUserName("관리자");
    }

    @Transactional
    public void completeOperation(Long operationId){
        Operation op = operationMapper.getOperationById(operationId);
        if (op == null) throw new IllegalArgumentException("해당 수술이 존재하지 않습니다.");

        operationMapper.updateOperationStatus(operationId, "COMPLETED");


        OperationLog log = new OperationLog();
        log.setOperationId(operationId);
        log.setAction("수술 완료");
        log.setCreatedAt(LocalDateTime.now());
        log.setUserName(op.getDoctorName());
        operationMapper.insertOperationLog(log);

        FinanceTransaction ft = new FinanceTransaction();
        ft.setRefId(operationId);
        ft.setRefType("OPERATION");
        ft.setPatientId(op.getPatientId());
        ft.setAdminId(op.getAdminId());
        ft.setAmount(op.getCost());
        ft.setCategory("OPERATION");
        ft.setType("INCOME");
        ft.setStatus("COMPLETED");
        ft.setDescription(op.getOperationName() + " 수술 수익");
        ft.setCreatedAt(LocalDate.now());
        financeTransactionMapper.insertFinance(ft);

        Map<String, Object> payload = new HashMap<>();
        payload.put("event", "OPERATION_COMPLETED");
        payload.put("operationId", operationId);
        payload.put("patientName", op.getPatientName());
        payload.put("doctorName", op.getDoctorName());
        payload.put("operationName", op.getOperationName());
        payload.put("message", op.getPatientId() + " 환자의 " + op.getOperationName() + " 수술이 종료되었습니다.");

        messagingTemplate.convertAndSend("/topic/operation/update", payload);
    }


    public byte[] generateOperationReport(Long operationId) {
        Operation op = operationMapper.getOperationById(operationId);
        if (op == null) throw new IllegalArgumentException("수술 정보가 존재하지 않습니다.");

        Patient patient = patientMapper.getPatientDetail(op.getPatientId());
        AdminAccount doctor = doctorMapper.doctorSelectById(op.getAdminId());
        OperationRoom room = operationMapper.getRoomById(op.getRoomId());
        List<OperationStaff> staffList = operationMapper.selectOperationStaffList(operationId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 60, 60, 60, 60);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            // ✅ 한글 폰트 세팅
            String fontPath = System.getProperty("os.name").toLowerCase().contains("win")
                    ? "C:/Windows/Fonts/malgun.ttf"
                    : "/usr/share/fonts/truetype/nanum/NanumGothic.ttf";
            BaseFont bf = BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            Font titleFont = new Font(bf, 18, Font.BOLD);
            Font labelFont = new Font(bf, 12, Font.BOLD);
            Font normalFont = new Font(bf, 11);

            // ✅ 헤더 (로고 + 제목 + 날짜)
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[]{7, 3});

            PdfPCell left = new PdfPCell();
            left.setBorder(Rectangle.NO_BORDER);
            left.addElement(new Paragraph("🏥 MediSync Medical Center",
                    new Font(bf, 14, Font.BOLD, new BaseColor(40, 60, 120))));
            Paragraph title = new Paragraph("수술 기록지 (Operation Record)", titleFont);
            title.setSpacingBefore(5);
            left.addElement(title);

            PdfPCell right = new PdfPCell();
            right.setBorder(Rectangle.NO_BORDER);
            right.setHorizontalAlignment(Element.ALIGN_RIGHT);
            try {
                Image logo = Image.getInstance(getClass().getResource("/static/images/logo.png"));
                logo.scaleToFit(60, 60);
                right.addElement(logo);
            } catch (Exception e) {
                right.addElement(new Paragraph("MediSync", new Font(bf, 12, Font.BOLD)));
            }
            right.addElement(new Paragraph("발행일: " + LocalDate.now(), new Font(bf, 10)));
            header.addCell(left);
            header.addCell(right);
            doc.add(header);

            LineSeparator sep = new LineSeparator();
            sep.setLineColor(new BaseColor(60, 80, 150));
            sep.setLineWidth(1.5f);
            doc.add(sep);
            doc.add(new Paragraph("\n"));

            // ✅ null-safe 환자 및 수술 기본정보
            PdfPTable info = new PdfPTable(2);
            info.setWidthPercentage(100);
            info.setSpacingAfter(15);

            info.addCell(makeInfoCell("환자명", labelFont));
            info.addCell(makeInfoCell(patient != null ? patient.getName() : "정보 없음", normalFont));

            info.addCell(makeInfoCell("수술명", labelFont));
            info.addCell(makeInfoCell(op.getOperationName(), normalFont));

            info.addCell(makeInfoCell("담당의", labelFont));
            info.addCell(makeInfoCell(doctor != null ? doctor.getName() : "미배정", normalFont));

            info.addCell(makeInfoCell("마취유형", labelFont));
            info.addCell(makeInfoCell(op.getAnesthesiaType() != null ? op.getAnesthesiaType() : "-", normalFont));

            info.addCell(makeInfoCell("수술실", labelFont));
            info.addCell(makeInfoCell(room != null ? room.getRoomName() : "미배정", normalFont));

            info.addCell(makeInfoCell("예정일시", labelFont));
            info.addCell(makeInfoCell(op.getScheduledDate() + " " +
                    (op.getScheduledTime() != null ? op.getScheduledTime().toString() : "-"), normalFont));

            info.addCell(makeInfoCell("상태", labelFont));
            info.addCell(makeInfoCell(op.getStatus(), normalFont));
            doc.add(info);

            // ✅ 참여 의료진
            if (staffList != null && !staffList.isEmpty()) {
                PdfPTable staffTable = new PdfPTable(2);
                staffTable.setWidthPercentage(100);
                staffTable.setSpacingBefore(10);
                staffTable.setSpacingAfter(20);

                staffTable.addCell(makeHeaderCell("이름", labelFont));
                staffTable.addCell(makeHeaderCell("직책", labelFont));

                for (OperationStaff s : staffList) {
                    staffTable.addCell(makeDataCell(s.getName(), normalFont));
                    staffTable.addCell(makeDataCell(s.getPosition(), normalFont));
                }
                doc.add(staffTable);
            }

            // ✅ 수술 결과
            Paragraph result = new Paragraph("수술 결과 및 소견", labelFont);
            result.setSpacingBefore(10);
            doc.add(result);
            doc.add(new Paragraph(op.getResultNote() != null ? op.getResultNote() : "-", normalFont));

            // ✅ Footer
            Paragraph footer = new Paragraph(
                    "본 수술 기록지는 MediSync 시스템을 통해 자동 생성된 공식 보고서입니다.\n"
                            + "담당 의료진의 검토 및 승인 후 환자 EMR에 자동 등록됩니다.\n"
                            + "────────────────────────────────────────────\n"
                            + "Generated by MediSync OR System | Verified: YES | Version: v1.0",
                    new Font(bf, 9, Font.ITALIC, new BaseColor(80, 80, 80))
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(20);
            doc.add(footer);

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF 생성 실패", e);
        }
    }


    // ======= 🔧 유틸 =======
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

}

