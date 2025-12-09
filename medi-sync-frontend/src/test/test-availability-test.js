import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};

export default function () {
  const url = "http://localhost:8080/api/testSchedule/check";

  const params = {
    testCode: "T100",
    testDate: "2025-01-20",
    testTime: "10:00",
  };

  const query = `?testCode=${params.testCode}&testDate=${params.testDate}&testTime=${params.testTime}`;

  const res = http.get(url + query);

  check(res, {
    "status 200": (r) => r.status === 200,
    "has available": (r) => r.body.includes("available"),
  });

  sleep(1);
}
