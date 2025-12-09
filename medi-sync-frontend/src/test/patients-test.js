import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500, // 동시에 30명 접속
  duration: "20s", // 20초 동안 요청 반복
};

const BASE_URL = "http://192.168.0.24:8080"; // ← 너의 서버 주소로 설정

export default function () {
  // 1) 전체 환자 조회
  const res1 = http.get(`${BASE_URL}/api/patients`);

  check(res1, {
    "patients status = 200": (r) => r.status === 200,
    "patients < 300ms": (r) => r.timings.duration < 300,
  });

  // 2) 입원 환자 조회
  const res2 = http.get(`${BASE_URL}/api/patients/inpatients`);

  check(res2, {
    "inpatients status = 200": (r) => r.status === 200,
    "inpatients < 300ms": (r) => r.timings.duration < 300,
  });

  sleep(1); // VU별 1초 pause → 서버 과부하 방지
}
