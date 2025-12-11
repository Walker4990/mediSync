package com.mediSync.project.insurance.service;

import com.mediSync.project.insurance.mapper.InsurerMapper;
import com.mediSync.project.insurance.mapper.PatientInsuranceMapper;
import com.mediSync.project.insurance.vo.Insurer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InsurerSyncService {
    private final KftcInsuranceClient client;
    private final InsurerMapper insurerMapper;
    private final PatientInsuranceMapper patientInsuranceMapper;

    @Transactional
    public int sync() {
        List<Map<String, Object>> list = client.fetchInsurer();
        if (list == null || list.isEmpty()) return 0; // ✅ NPE 방지

        int updated = 0;
        for (Map<String, Object> it : list) {
            // ✅ 양쪽 키 모두 허용 (너가 쓰던 키 + KFTC 표준 키)
            String code     = pick(it, "insurer_code", "insr_code", "code");
            String name     = pick(it, "insurer_name", "insr_name", "name");
            String endpoint = pick(it, "insurer_endpoint", "api_url", "endpoint");
            String contact  = pick(it, "insurer_contact", "tel", "contact");

            updated += insurerMapper.upsertInsurer(code, name, endpoint, contact);
        }
        return updated;
    }

    // ---------- helpers ----------
    private String pick(Map<String, Object> m, String... keys) {
        for (String k : keys) {
            Object v = m.get(k);
            if (v != null) return String.valueOf(v);
        }
        return null;
    }


    public int syncMock() {
        int c = 0;

        // 보험사 1 - 국민건강보험공단
        c += insurerMapper.upsertInsurer(
                "INS001",
                "국민건강보험공단",
                "https://api.nhis.or.kr",
                "1588-2000"
        );

        // 보험사 2 - 삼성화재보험
        c += insurerMapper.upsertInsurer(
                "INS002",
                "삼성화재보험",
                "https://api.samsungfire.com",
                "02-3456-7890"
        );

        // 보험사 3 - 현대해상
        c += insurerMapper.upsertInsurer(
                "INS003",
                "현대해상화재보험",
                "https://api.hi.co.kr",
                "02-1588-5656"
        );

        // 보험사 4 - DB손해보험
        c += insurerMapper.upsertInsurer(
                "INS004",
                "DB손해보험",
                "https://api.dbins.co.kr",
                "02-1588-0100"
        );

        // 보험사 5 - 한화생명
        c += insurerMapper.upsertInsurer(
                "INS005",
                "한화생명보험",
                "https://api.hanwhalife.com",
                "02-789-5678"
        );

        // 추가로 보험 가입정보 더미 데이터를 출력용으로도 반환 (테스트용 로그)
        List<Map<String, Object>> insuranceList = List.of(
                Map.of(
                        "insu_num", "S20231122001",
                        "prod_name", "삼성화재 실손의료보험",
                        "insu_type", "03",
                        "insu_status", "02",
                        "issue_date", "20231122",
                        "exp_date", "20331122",
                        "insurer_code", "INS002"
                ),
                Map.of(
                        "insu_num", "H20220515012",
                        "prod_name", "현대해상 암보험",
                        "insu_type", "01",
                        "insu_status", "02",
                        "issue_date", "20220515",
                        "exp_date", "20320515",
                        "insurer_code", "INS003"
                ),
                Map.of(
                        "insu_num", "D20200105007",
                        "prod_name", "DB손해보험 운전자보험",
                        "insu_type", "02",
                        "insu_status", "05",
                        "issue_date", "20200105",
                        "exp_date", "20250105",
                        "insurer_code", "INS004"
                ),
                Map.of(
                        "insu_num", "H20190304033",
                        "prod_name", "한화생명 종신보험",
                        "insu_type", "04",
                        "insu_status", "02",
                        "issue_date", "20190304",
                        "exp_date", "20490304",
                        "insurer_code", "INS005"
                )
        );

        System.out.println("📋 Mock 보험가입 내역:");
        insuranceList.forEach(System.out::println);

        return c;
    }
    @Transactional
    public int syncForPatient(Long patientId){
        List<Map<String, Object>> mockList = client.fetchMockInsurance();
        if(mockList.isEmpty() || mockList == null) return 0;

        int inserted = 0;
        for (Map<String, Object> data : mockList) {
            Map<String, Object> mutableData = new HashMap<>(data); // ✅ 복제
            mutableData.put("patient_id", patientId); // 이제 put() 가능
            inserted += patientInsuranceMapper.upsertInsurance(mutableData);
        }
        System.out.printf("✅ [환자 %d] 보험가입 %d건 동기화 완료%n", patientId, inserted);
        return inserted;
    }

    public List<Insurer> getInsurerCode(){
        return insurerMapper.getInsurerCode();
    }

}
