import React, {useEffect, useState} from "react";
import {insuranceApi} from "../../api/InsuranceApi";
import InsuranceList from "../../component/InsuranceList";
import ClaimHistory from "../../component/ClaimHistory";
import {jwtDecode} from "jwt-decode";

export default function PatientInsurancePage() {
    const [patientId, setPatientId] = useState(null);
    const [insList, setInsList] = useState([]);
    const [ claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            setPatientId(decoded.userId || decoded.patientId);
            console.log('환자 아이디 : ', decoded.userId || decoded.patientId);
        }
    })

    useEffect(() => {
        if (!patientId) return; // patientId 없으면 실행 안함
        loadData();
    }, [patientId]);

    const loadData = async () => {
        const [insRes, claimRes] = await Promise.all([
            insuranceApi.list(patientId),
            insuranceApi.claims(patientId)
        ]);
        setInsList(insRes.data);
        setClaims(claimRes.data);
    }

    const handleSync = async () => {
        setLoading(true);
        await insuranceApi.sync(patientId);
        await loadData();
        setLoading(false);
    }
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">내 보험 관리</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleSync} disabled={loading}>
                    {loading ? "동기화 중..." : "보험 내역 동기화"}
                </button>

            </div>
            <InsuranceList insList={insList} />
            <ClaimHistory claims={claims} />
        </div>

    );
}