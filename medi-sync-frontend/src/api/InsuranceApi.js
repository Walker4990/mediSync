import axios from "axios";

const BASE = "http://192.168.0.24:8080/api/patient-insurance";

const CLAIM = "http://192.168.0.24:8080/api/claim";
export const insuranceApi = {
    list: (patientId) => axios.get(`${BASE}/${patientId}`),
    sync: (patientId) => axios.post(`${BASE}/${patientId}/sync`),
    claims: (patientId) => axios.get(`${CLAIM}/${patientId}/claims`),
};