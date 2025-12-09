import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};

const BASE = "http://192.168.0.24:8080";

export default function () {
  const recordId = 1;

  // 1) 진료 상세 조회
  const res1 = http.get(`${BASE}/api/records/patient/detail/${recordId}`);
  check(res1, { "record ok": (r) => r.status === 200 });

  // 2) 처방 저장 (약 처방 1건)
  const payload = JSON.stringify({
    recordId: 1,
    patientId: 1,
    type: "DRUG",
    drugName: "타이레놀",
    dosage: "1회 1정",
    duration: "3일",
    unit: "정",
    unitPrice: 500,
    doctorName: "홍의사",
    patientName: "홍길동",
  });

  const params = { headers: { "Content-Type": "application/json" } };

  const res2 = http.post(`${BASE}/api/prescriptions/add`, payload, params);
  check(res2, { "prescription ok": (r) => r.status === 200 });

  sleep(1);
}
