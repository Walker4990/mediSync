import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};

const BASE = "http://192.168.0.24:8080";

export default function () {
  const recordId = 1; // 테스트할 실제 recordId

  const res = http.get(`${BASE}/api/records/patient/detail/${recordId}`);

  check(res, {
    "status 200": (r) => r.status === 200,
    "duration < 300ms": (r) => r.timings.duration < 300,
  });

  sleep(1);
}
