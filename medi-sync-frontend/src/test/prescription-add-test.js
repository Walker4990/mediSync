import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};

const BASE = "http://192.168.0.24:8080";

export default function () {
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

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const res = http.post(`${BASE}/api/prescriptions/add`, payload, params);

  check(res, {
    "status 200": (r) => r.status === 200,
    "duration < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
