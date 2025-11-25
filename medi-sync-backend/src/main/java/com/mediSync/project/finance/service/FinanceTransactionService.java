package com.mediSync.project.finance.service;


import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
import com.mediSync.project.patient.mapper.PatientMapper;
import com.mediSync.project.patient.vo.Patient;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FinanceTransactionService {
    private final JavaMailSender javaMailSender;
    private final PatientMapper patientMapper;
    private final FinanceTransactionMapper financeTransactionMapper;

    public Map<String, Object> selectAll(Map<String, Object> filters, int page, int size){

        int offset =  (page - 1) * size;
        List<FinanceTransaction> items = financeTransactionMapper.selectAll(filters, offset, size);

        int totalCount = financeTransactionMapper.countAll(filters);
        int totalPages = (int) Math.ceil((double)totalCount / size);

        return Map.of(
                "items", items,
                "totalCount", totalCount,
                "totalPages", totalPages
        );
    }
    public Map<String, Object> getDashboardSummary(){
        Map<String, Object> result = new HashMap<>();
        result.put("dailyData", financeTransactionMapper.getDailyFinance());
        result.put("statusData", financeTransactionMapper.getStatusSummary());
        return result;
    }


    public List<Map<String, Object>> getDeptIncomeSummary() {
        return financeTransactionMapper.getDeptIncomeSummary();
    }

    public List<Map<String, Object>> getDeptNetProfit() {
        return financeTransactionMapper.getDeptNetProfit();
    }


    public Map<String, Object> getUnpaidInfo(Long patientId) {
        Integer total = financeTransactionMapper.getUnpaidTotal(patientId);
        List<FinanceTransaction> detail = financeTransactionMapper.getUnpaidDetails(patientId);

        Map<String, Object> result = new HashMap<>();
        result.put("totalUnpaid", total);
        result.put("detail", detail);

        return result;
    }

    @Transactional
    public void sendUnpaidEmail(Long patientId) {

        Patient p = patientMapper.getPatientDetail(patientId);
        if (p == null || p.getEmail() == null) {
            throw new IllegalArgumentException("환자 이메일 없음");
        }

        Map<String, Object> unpaid = financeTransactionMapper.getUnpaidSummary(patientId);

        if (unpaid == null || unpaid.get("unpaidTotal") == null) {
            throw new IllegalStateException("해당 환자의 미납 내역이 없습니다.");
        }

        Long totalUnpaid = ((Number) unpaid.get("unpaidTotal")).longValue();
        Integer count = ((Number) unpaid.get("countTx")).intValue();

        //  1) 템플릿 로딩
        String template = loadTemplate("UnpaidEmailTemplate.html");

        //  2) 템플릿 데이터를 실제 값으로 치환
        String html = template
                .replace("{{patientName}}", p.getName())
                .replace("{{totalUnpaid}}", String.format("%,d", totalUnpaid))
                .replace("{{countTx}}", count.toString());

        //  3) 메일 전송
        sendHtmlMail(p.getEmail(), "[MediSync] 미납 안내드립니다", html);
    }
    public void sendHtmlMail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // HTML 활성화

            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("이메일 발송 실패: " + e.getMessage());
        }
    }

    private String loadTemplate(String fileName) {
        try {
            return new String(
                    Files.readAllBytes(
                            Paths.get("src/main/resources/templates/" + fileName)
                    ),
                    "UTF-8"
            );
        } catch (Exception e) {
            throw new RuntimeException("템플릿 로딩 실패: " + e.getMessage());
        }
    }
}
