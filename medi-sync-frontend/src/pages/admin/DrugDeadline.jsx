import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState, useMemo, useRef } from "react";
import AdminHeader from "../../component/AdminHeader";
import { button, div, p, pre, span, table, tr } from "framer-motion/client";
import DrugDisposeTab from "../../component/DrugDisposeTab";
import DrugDisposeAll from "../../component/DrugDisposeAll";
import DrugDisposeModal from "../../component/DrugDisposeModal";
import DrugDisposeInspect from "../../component/DrugDisposeInspect";
import DrugInspectionCheckModal from "../../component/DrugInspectionCheckModal";
import DrugDisposedPage from "../../component/DrugDisposedPage";

export default function DrugDeadline() {
  //탭 조정
  const [filter, setFilter] = useState("all"); // all / inspected / disposed
  //약 리스트
  const [drugList, setDrugList] = useState([]);
  //검사 리스트
  const [inspectionList, setInspectionList] = useState([]);
  //약 선택 시 모달 열림
  const [selectedDrug, setSelectedDrug] = useState(null);
  //검색 기능
  const [search, setSearch] = useState("");
  // 약 선택 시 모달에 해당 약 정보 저쟝
  const [selectedDrugDispose, setSelectedDrugDispose] = useState(null);
  //모달에서 폐기 개수
  const [disposeQty, setDisposeQty] = useState(0);
  const [drugLog, setDrugLog] = useState([]);
  const [sortOrder, setSortOrder] = useState("");
  const [selectedDrugDeadline, setSelectedDrugDeadline] = useState("");
  const [page, setPage] = useState(1);
  const size = 10; // 한 페이지당 10개

  //전체 조회
  const fetchDrugList = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/drug/all");
      setDrugList(res.data);
      console.log("약품 전체 조회 : ", res.data);
    } catch (err) {
      console.error("약품 전체조회 실패", err);
    }
  };

  //검사 리스트 가져오기
  const fetchInspectionList = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/inspection/month");

      console.log("이번달 검사 리스트 조회 : ", res.data);
      setInspectionList(res.data);
    } catch (err) {
      console.error("이번달 검사 리스트 조회 실패", err);
    }
  };

  //폐기 기록 가져오기
  const fetchDisposedList = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/inspection/disponse/log",
        {
          params: {
            sort: sortOrder,
            drugCode: selectedDrugDeadline,
            page,
            size,
          },
        }
      );
      console.log("폐기 기록 조회 : ", res.data);
      setDrugLog(res.data);
    } catch (err) {
      console.error("폐기 기록 조회 실패", err);
    }
  };

  //모달 열기
  const openModal = (item) => {
    setSelectedDrug(item);
  };

  const closeModal = () => {
    setSelectedDrug(null);
  };
  useEffect(() => {
    if (filter === "disposed") {
      fetchDisposedList();
    }
  }, [filter, page, sortOrder, selectedDrugDeadline]);

  //탭 바뀔때 데이터 가져오기
  useEffect(() => {
    fetchDrugList();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      fetchDrugList();
    } else if (filter === "inspected") {
      fetchInspectionList();
    } else if (filter === "disposed") {
      fetchDisposedList();
    }
  }, [filter]);

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />

      <main className="max-w-7xl mx-auto pt-24 px-8">
        {/* 제목 + 탭 버튼 */}
        <DrugDisposeTab filter={filter} setFilter={setFilter} />
        {/* 메인 레이아웃 */}
        <div className="max-w-5xl mx-auto">
          {/*전체 페이지 */}
          {filter == "all" && (
            <DrugDisposeAll
              drugList={drugList}
              setSelectedDrugDispose={setSelectedDrugDispose}
              setDisposeQty={setDisposeQty}
            />
          )}
          {/*폐기 등록 모달 */}
          {selectedDrugDispose && (
            <DrugDisposeModal
              selectedDrugDispose={selectedDrugDispose}
              setSelectedDrugDispose={setSelectedDrugDispose}
              fetchDrugList={fetchDrugList}
              setDisposeQty={setDisposeQty}
              disposeQty={disposeQty}
            />
          )}

          {/* 검사 리스트 + 폐기 버튼 */}
          {filter === "inspected" && (
            <DrugDisposeInspect
              filter={filter}
              inspectionList={inspectionList}
              setSelectedDrug={setSelectedDrug}
              fetchInspectionList={fetchInspectionList}
            />
          )}
          {/*폐기 기록 페이지 */}
          {filter == "disposed" && (
            <DrugDisposedPage
              drugList={drugList}
              drugLog={drugLog}
              fetchDisposedList={fetchDisposedList}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              page={page}
              setPage={setPage}
            />
          )}
        </div>

        {/*모달 */}
        {selectedDrug && (
          <DrugInspectionCheckModal
            selectedDrug={selectedDrug}
            setSelectedDrug={setSelectedDrug}
            fetchInspectionList={fetchInspectionList}
            fetchDrugList={fetchDrugList}
            filter={filter}
          />
        )}
      </main>
    </div>
  );
}
