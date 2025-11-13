import React, {useEffect, useState} from "react";
import {insuranceApi} from "../../api/InsuranceApi";
import InsuranceList from "../../component/InsuranceList";
import ClaimHistory from "../../component/ClaimHistory";

export default function PatientInsurancePage({patientId}) {

    const [insList, setInsList] = useState([]);
    const [ claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [])

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