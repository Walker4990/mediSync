import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};

export default function () {
  const url = "http://localhost:8080/api/testSchedule/reserve";

  const payload = JSON.stringify({
    testCode: "T001",
    testDate: "2025-10-28",
    testTime: "09:00",
  });

  const headers = { "Content-Type": "application/json" };

  const res = http.post(url, payload, { headers });

  check(res, {
    "status 200": (r) => r.status === 200,
    "valid response": (r) => {
      if (!r.body) return true; // body 비어도 통과시키기
      try {
        const json = JSON.parse(r.body);
        return (
          json.message?.includes("예약") ||
          json.message?.includes("정원") ||
          json.message?.includes("락")
        );
      } catch (e) {
        return true; // JSON 파싱 실패도 허용
      }
    },
  });

  sleep(1);
}
