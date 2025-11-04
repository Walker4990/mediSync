import React, {useEffect, useState} from "react";
import axios from "axios";

export default function PatientDetailModal({patient} ) {

    // 환자 특이사항 탭
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");

    useEffect(() => {
        axios.get(`http://192.168.0.24:8080/api/patient/notes/${patient.patientId}`)
            .then(res => setNotes(res.data))
            .catch(err => console.error("❌ 특이사항 조회 실패:", err));
    }, [patient]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return alert("내용을 입력하세요");
        await axios.post("http://192.168.0.24:8080/api/patient/notes", {
            patientId: patient.patientId,
            staffId: 1, // 로그인 사용자 ID로 대체
            noteType: "GENERAL",
            content: newNote,
            visibility: "PUBLIC",
        });
        setNewNote("");
        const res = await axios.get(`http://192.168.0.24:8080/api/patient/notes/${patient.patientId}`);
        setNotes(res.data);
    };

    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🩺 환자 특이사항</h3>
            <div className="border rounded-lg p-3 bg-gray-50 h-64 overflow-y-auto">
                {notes.length === 0 && <p className="text-gray-400 text-center py-6">등록된 특이사항이 없습니다.</p>}
                {notes.map(n => (
                    <div key={n.noteId} className="border-b py-2">
                        <p>{n.content}</p>
                        <p className="text-xs text-gray-500">{n.noteType} | {n.createdAt.slice(0, 10)}</p>
                    </div>
                ))}
            </div>
            <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full border p-2 rounded mt-2"
                placeholder="새 특이사항 입력..."
            />
            <button onClick={handleAddNote} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
                등록
            </button>
        </div>
    );

}