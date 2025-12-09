import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "20s",
};

const BASE = "http://192.168.0.24:8080";

export default function () {
  // 1) 보험사 mock 동기화
  const syncRes = http.post(`${BASE}/api/insurer/sync`, null);
  check(syncRes, { "sync ok": (r) => r.status === 200 });

  // 2) 보험금 청구
  const claimPayload = JSON.stringify({
    claimId: null,
    recordId: 10,
    insurerCode: "INS001",
    claimAmount: 12000,
    claimItems: [
      { itemName: "진료비", amount: 8000 },
      { itemName: "처치비", amount: 4000 },
    ],
  });

  const claimRes = http.post(`${BASE}/api/claim/submit`, claimPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(claimRes, { "claim ok": (r) => r.status === 200 });

  sleep(1);
}
