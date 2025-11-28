import axios from "axios";

export const API_URL = "http://localhost:8080/api/admins/mypage";
export const BASE_URL = "http://localhost:8080";
export const UPLOAD_API_URL = "http://localhost:8080/api/uploads/profile";
export const DEPT_API_URL = "http://localhost:8080/api/departments";

export const POSITION_OPTIONS = [
  { value: "NURSE", label: "간호사" },
  { value: "RADIOLOGIST", label: "방사선사" },
  { value: "LAB_TECH", label: "임상병리사" },
  { value: "ASSISTANT", label: "진료보조" },
  { value: "ADMIN", label: "원무/행정" },
  { value: "DOCTOR", label: "의사" },
];

export const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "재직 중" },
  { value: "LEAVE", label: "휴직" },
  { value: "RETIRED", label: "퇴사" },
];

export const getOptionLabel = (options, value) => {
  const option = options.find((opt) => String(opt.value) === String(value));
  return option ? option.label : value;
};
