import { useParams } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const MedicalDetail = () => {
  const { recordId } = useParams();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const fetchRecordDetail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/records/patient/detail/${recordId}`
        );
        setRecord(res.data);
        console.log("상세조회 데이터 : ", res.data);
      } catch (error) {
        console.error("진료 상세 조회 실패 : ", error);
      }
    };
    fetchRecordDetail();
  }, [recordId]);
  if (!record) return <p>로딩중</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">진료 상세 내역</h2>
      <p>
        <strong>진료과 </strong>
        {record.deptName}
      </p>
      <p>
        <strong>담당의 </strong>
        {record.doctorName}
      </p>
      <p>
        <strong>진단명 </strong>
        {record.deptName}
      </p>
    </div>
  );
};

export default MedicalDetail;
