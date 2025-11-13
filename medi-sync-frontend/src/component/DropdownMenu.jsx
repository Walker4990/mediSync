import React, { useState, useRef } from "react";

const DropdownMenu = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  // ⭐️ 닫기 타이머 ID를 저장하기 위한 Ref 생성
  const timeoutRef = useRef(null);

  const [viewMode, setViewMode] = useState("list");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deletingDoctor, setDeletingDoctor] = useState(null);

  // 마우스가 메뉴 영역에 진입했을 때 (열림)
  const handleMouseEnter = () => {
    // ⚠️ 메뉴를 열기 전에, 실행 중인 닫기 타이머가 있다면 취소합니다.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  // 마우스가 메뉴 영역에서 벗어났을 때 (딜레이 후 닫힘)
  const handleMouseLeave = () => {
    // ⭐️ 닫기 전에 200ms 딜레이를 설정합니다.
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // 항목 클릭 시 메뉴를 닫는 함수
  const handleItemClick = () => {
    // 항목 클릭 시 즉시 닫고 딜레이 타이머가 있다면 취소합니다.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  return (
    // ⭐️ onMouseEnter와 onMouseLeave 이벤트 핸들러를 유지
    <div
      className="relative"
      onMouseEnter={handleMouseEnter} // 마우스 진입 시 즉시 열고 닫기 타이머 취소
      onMouseLeave={handleMouseLeave} // 마우스 이탈 시 딜레이 후 닫기
    >
      {/* 메뉴 타이틀 버튼 */}
      <button
        className="hover:text-gray-200 focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-normal">{title}</span>
      </button>

      {/* 드롭다운 내용 */}
      {isOpen && (
        <div
          className="absolute left-0 mt-2 pt-1 w-40 bg-white rounded-md shadow-lg z-10"
          role="menu"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                role="menuitem"
                onClick={handleItemClick} // 항목 클릭 시 메뉴 닫기
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
