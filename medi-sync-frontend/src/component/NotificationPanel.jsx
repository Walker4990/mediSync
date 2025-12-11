import { useNotifications } from "../context/NotificationContext";
import { Bell } from "lucide-react";
import {useState} from "react";

export default function NotificationPanel() {
    const { notifications, clearNotifications } = useNotifications();
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-gray-700 hover:text-blue-600"
            >
                <Bell size={22} className="hidden" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">
            {notifications.length}
          </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-3 border">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700">알림 내역</span>
                        <button
                            className="text-xs text-gray-400 hover:text-red-500"
                            onClick={clearNotifications}
                        >
                            전체 삭제
                        </button>
                    </div>
                    {notifications.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center">알림이 없습니다.</p>
                    ) : (
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                            {notifications.map((n) => (
                                <li
                                    key={n.id}
                                    className="p-2 border rounded hover:bg-blue-50 cursor-pointer"
                                    onClick={() =>
                                        window.open(`http://192.168.0.24:8080/api/testResult/pdf/${n.reservationId}`)
                                    }
                                >
                                    <p className="font-medium text-blue-700 text-sm">{n.title}</p>
                                    <p className="text-xs text-gray-500">{n.time}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
