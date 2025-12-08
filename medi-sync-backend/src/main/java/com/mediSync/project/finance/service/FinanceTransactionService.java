package com.mediSync.project.finance.service;


import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
import com.mediSync.project.patient.mapper.PatientMapper;
import com.mediSync.project.patient.vo.Patient;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class FinanceTransactionService {
    private final JavaMailSender javaMailSender;
    private final PatientMapper patientMapper;
    private final FinanceTransactionMapper financeTransactionMapper;
    private final RedisTemplate<String, Object> redis;

    public Map<String, Object> selectAll(Map<String, Object> filters, int page, int size){

        int offset =  (page - 1) * size;
        List<FinanceTransaction> items = financeTransactionMapper.selectAll(filters, offset, size);

        // 🔥 1) 필터 + 페이지 조합을 키로 변환
        String cacheKey = "finance:count:" + filters.toString();

        // 🔥 2) count 캐싱 조회
        Integer totalCount = (Integer) redis.opsForValue().get(cacheKey);

        // 🔥 3) 캐시에 없으면 DB 조회 후 10초 캐싱
        if (totalCount == null) {
            totalCount = financeTransactionMapper.countAll(filters);
            redis.opsForValue().set(cacheKey, totalCount, Duration.ofSeconds(10));
        }

        int totalPages = (int) Math.ceil((double)totalCount / size);

        return Map.of(
                "items", items,
                "totalCount", totalCount,
                "totalPages", totalPages
        );
    }

    // 🔥 여기만 캐싱 적용
    public Map<String, Object> getDashboardSummary(){

        String key = "finance:summary";

        Map<String, Object> cached
                = (Map<String, Object>) redis.opsForValue().get(key);

        if (cached != null) {
            return cached; // 캐시 HIT → 즉시 응답
        }

        // 기존 로직 그대로
        Map<String, Object> result = new HashMap<>();
        result.put("dailyData", financeTransactionMapper.getDailyFinance());
        result.put("statusData", financeTransactionMapper.getStatusSummary());

        // 캐시 저장 (10초)
        redis.opsForValue().set(key, result, 10, TimeUnit.SECONDS);

        return result;
    }

    public List<Map<String, Object>> getDeptIncomeSummary() {
        return financeTransactionMapper.getDeptIncomeSummary();
    }

    public List<Map<String, Object>> getDeptNetProfit() {
        return financeTransactionMapper.getDeptNetProfit();
    }

    public Map<String, Object> getUnpaidInfo(Long patientId) {

        String key = "unpaid:" + patientId;

        // 1) 캐시 HIT → 바로 반환
        Map<String, Object> cached = (Map<String, Object>) redis.opsForValue().get(key);
        if (cached != null) {
            return cached;
        }

        // 2) 기존 DB 조회 그대로 유지
        Integer total = financeTransactionMapper.getUnpaidTotal(patientId);
        List<FinanceTransaction> detail = financeTransactionMapper.getUnpaidDetails(patientId);

        Map<String, Object> result = new HashMap<>();
        result.put("totalUnpaid", total);
        result.put("detail", detail);

        // 3) 캐시에 60초 저장
        redis.opsForValue().set(key, result, Duration.ofSeconds(30));

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

        String template = loadTemplate("UnpaidEmailTemplate.html");

        String html = template
                .replace("{{patientName}}", p.getName())
                .replace("{{totalUnpaid}}", String.format("%,d", totalUnpaid))
                .replace("{{countTx}}", count.toString());

        sendHtmlMail(p.getEmail(), "[MediSync] 미납 안내드립니다", html);
    }

    public void sendHtmlMail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

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
