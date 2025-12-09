import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};

export default function () {
  const id = Math.floor(Math.random() * 50) + 1;
  const res = http.get(`http://localhost:8080/api/finance/unpaid/alert/${id}`);

  check(res, {
    "status 200": (r) => r.status === 200,
  });
}
