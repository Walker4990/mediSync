import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};

export default function () {
  const url = "http://localhost:8080/api/test/reservation";
  const scheduleIds = [1, 2, 3]; // 실제 DB 기준
  const recordIds = [10, 11, 12, 15, 20]; // 실제 DB 기준

  const payload = JSON.stringify({
    scheduleId: scheduleIds[Math.floor(Math.random() * scheduleIds.length)],
    recordId: recordIds[Math.floor(Math.random() * recordIds.length)],
    patientId: 111,
    adminId: 1,
    status: "RESERVED",
  });

  const headers = { "Content-Type": "application/json" };

  const res = http.post(url, payload, { headers });

  check(res, {
    "status 200": (r) => r.status === 200,
    "saved success": (r) => r.body.includes("success"),
  });

  sleep(1);
}
