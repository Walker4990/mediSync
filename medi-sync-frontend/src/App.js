import axios from "axios";
import { useEffect, useState } from "react";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios
            .get("http://192.168.0.24:8080/api/test") // ✅ 네 PC IP + 포트 + 엔드포인트
            .then((res) => setMessage(res.data))
            .catch((err) => setMessage("❌ 연결 실패: " + err.message));
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
            <h2 className="text-3xl font-bold mb-4 text-blue-600">
                React ↔ Spring 연결 테스트
            </h2>

            <p
                className={`text-xl font-medium px-6 py-3 rounded-lg shadow-md ${
                    message.startsWith("❌")
                        ? "bg-red-100 text-red-600 border border-red-300"
                        : "bg-green-100 text-green-700 border border-green-300"
                }`}
            >
                {message || "⏳ 서버 응답 대기 중..."}
            </p>
        </div>
    );
}

export default App;
