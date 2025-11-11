import axios from "axios";

const API_BASE = "http://192.168.0.24:8080/api/insurer";

export const fetchInsurers = async () => {
    const res = await axios.get(`${API_BASE}/list`);
    return res.data;
};

export const syncInsurers = async () => {
    const res = await axios.post(`${API_BASE}/sync`);
    return res.data;
};
