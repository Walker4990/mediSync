import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};

export default function () {
  const page = Math.floor(Math.random() * 10) + 1;

  const query = {
    page: page,
    size: 20,
    type: "INCOME",
    category: "CONSULT",
    status: "PAID",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    sort: "desc",
  };

  const url =
    "http://localhost:8080/api/finance/list?" +
    Object.entries(query)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

  const res = http.get(url, {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "status 200": (r) => r.status === 200,
    "contains list": (r) => r.body.includes("items"),
    "contains totalCount": (r) => r.body.includes("totalCount"),
  });

  sleep(1);
}
