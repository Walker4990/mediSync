import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 100,
  duration: "20s",
};

const BASE = "http://192.168.0.24:8080";

export default function () {
  const recordId = 1;

  const res = http.get(`${BASE}/api/prescriptions/pdf/${recordId}`);

  check(res, {
    "status 200": (r) => r.status === 200,
    "PDF exists": (r) => r.body.length > 0,
    "duration < 700ms": (r) => r.timings.duration < 700,
  });

  sleep(1);
}
