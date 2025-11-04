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
  //로딩, 값이 없을때의 화면
  if (!record)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#0199f8] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg font-medium animate-pulse">
            진료 내역을 불러오는 중입니다....
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 w-[700px] h-[900px] overflow-auto mx-auto">
      <div className="bg-white w-full max-w-3xl shadow-lg rounded-2xl p-8 border-t-4 border-[#0199f8]">
        <h2 className="text-2xl font-bold text-[#0199f8] mb-6 text-center">
          진료 상세 내역
        </h2>
        <div className="space-y-5">
          <div>
            <p className="text-gray-600 text-5m">환자명</p>
            <p className="text-lg font-medium text-gray-800">
              {record.patientName}
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">진료과</p>
            <p className="text-lg font-medium text-gray-800">
              {record.deptName}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">담당의</p>
            <p className="text-lg font-medium text-gray-800">
              {record.doctorName}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">진단명</p>
            <p className="text-lg font-medium text-gray-800">
              {record.diagnosis}
            </p>
          </div>
          {/*추가 정보*/}
          <div>
            <p className="text-gray-600 text-5m">진료일자</p>
            <p className="text-lg font-medium text-gray-800">
              {record.createdAt.replace("T", " ")}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-5m">진료상태</p>
            <p className="text-lg font-medium text-gray-800">{record.status}</p>
          </div>
          <div>
            <p className="text-gray-600 text-5m">지불 금액</p>
            <p className="text-lg font-medium text-gray-800">
              {record.totalCost}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-5m">진료일자</p>
            <p className="text-lg font-medium text-gray-800">
              {record.createdAt}
            </p>
          </div>
        </div>

        <div className="my-8 flex justify-center">
          <button
            onClick={() => window.close()}
            className="px-5 py-2 rounded-lg bg-[#0199f8] hover:bg-[#0287da] text-white font-semibold transition-colors duration-200 shadow-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalDetail;
