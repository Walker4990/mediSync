import { useEffect, useState } from "react";
import axios from "axios";
import { div, li, p, ul } from "framer-motion/client";
export default function DrugInspectionList({ filter, onSelectDrug }) {
  const API_URL = "http://192.168.0.24:8080/api/inspection";
  const TEST_URL = "http://localhost:8080/api/inspection";
  const [drugInfo, setDrugInfo] = useState([]);

  const fetchDrugData = async () => {
    try {
      const res = await axios.get(`${TEST_URL}`);
      setDrugInfo(res.data);
    } catch (err) {
      console.error("약품 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchDrugData();
  }, []);

  const filtered =
    filter === "all" ? drugInfo : drugInfo.filter((d) => d.isChecked === null);

  return (
    <div className="bg-white p-5 rounded-xl shadow-xl max-h-[800px] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">약품 목록</h2>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">
          등록된 약품이 없습니다.
        </p>
      ) : (
        <ul className="divide-y">
          {filtered.map((drug) => (
            <li
              key={drug.drugCode}
              className="p-3 cursor-pointer hover:bg-blue-50 rounded"
              onClick={() => onSelectDrug(drug)}
            >
              <div className="font-medium">{drug.drugName}</div>
              <div className="text-sm text-gray-500">코드: {drug.drugCode}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
