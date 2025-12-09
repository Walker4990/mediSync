import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};
export default function () {
  const patientId = 111;

  const res = http.get(
    `http://localhost:8080/api/finance/unpaid/alert/${patientId}`
  );

  const json = (() => {
    try {
      return JSON.parse(res.body);
    } catch {
      return null;
    }
  })();

  check(res, {
    "status 200": (r) => r.status === 200,
    "valid JSON": () => json !== null,
    "contains totalUnpaid": () => json && json.totalUnpaid !== undefined,
  });

  sleep(1);
}
