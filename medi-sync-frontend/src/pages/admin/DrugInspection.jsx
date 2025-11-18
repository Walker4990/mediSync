import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import AdminHeader from "../../component/AdminHeader";

export default function DrugInspection() {
  //약품 검사 작성
  const [drugInfo, setDrugInfo] = useState([]);
  //해당 약품 글릭 시 약 정보 저장할 장소
  const [selectedDrug, setSelectedModal] = useState(null);

  //모달 열림 여부
  const [isModalOpen, setIsModalOpen] = useState(false);

  //검사 작성 값
      setDrugInfo(res.data);
    } catch (err) {
      console.error("조회 실패", err);
    }
  };
  //선택한 값 찾아서 넣기
  const fetchDrugInsectionByCode = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/drug/getInfo`);
      setSelectedModal(res.data);
    } catch (err) {
      console.error("상세 정보 불러오기 실패", err);
    }
  };

  //   useEffect(() =>{
  //     fetchDrugInsection();
  //   },[]);

  //모달 열기
  const openMocal = (drug) => {
    setSelectedModal(drug);
    setIsModalOpen(true);
  };

  //모달 열기
  const cloasMocal = () => {
    setSelectedModal(null);
    setInspectionStatus("PASS");
    setIsModalOpen(false);
  };

  //약 검사 페이지
  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      {/* 상단 고정 관리자 헤더 */}
      <AdminHeader />

      {/* 컨텐츠 영역 */}
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          약품 검사 페이지
        </h1>
        {/*검사 페이지 레이아웃 */}

        {/*약품 목록 */}

        {/*약품 상세 + 검사 입력 */}

        {/*검사 상태 입력 */}

        {/*모달 */}
      </main>
    </div>
  );
}
