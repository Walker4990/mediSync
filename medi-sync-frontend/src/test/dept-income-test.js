import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};

export default function () {
  const res = http.get("http://localhost:8080/api/finance/dept-income");

  check(res, {
    "status 200": (r) => r.status === 200,
  });

  sleep(1);
}
