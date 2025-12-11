import axios from "axios";

const API_URL = "http://192.168.0.24:8080/api/drug";
const TEST_URL = "http://localhost:8080/api/drug";

export const getDrugs = () => axios.get(`${API_URL}/all`);
export const addDrug = (data) =>
  axios.post(`${API_URL}/insert`, data, {
    headers: { "Content-Type": "application/json" }, // ✅ 명시적으로 추가
  });
export const updateDrug = (data) => axios.put(`${TEST_URL}/update`, data);
export const deleteDrug = (code) => axios.delete(`${TEST_URL}/${code}`);
export const getDrugsPaged = (page, size) =>
  axios.get(`${API_URL}/page?page=${page}&size=${size}`);
