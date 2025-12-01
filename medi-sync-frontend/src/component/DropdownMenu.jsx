import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";

const DropdownMenu = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleItemClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="hover:text-gray-200 focus:outline-none"
        aria-expanded={isOpen}
      >
        {title}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-0 w-40 bg-white rounded-md shadow-lg z-50 overflow-hidden"
          role="menu"
        >
          <div className="py-1">
            {items.map((item, index) => {
              // onClick (로그아웃 등 기능 버튼)
              if (item.onClick) {
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      item.onClick(e);
                      handleItemClick();
                    }}
                    className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    role="menuitem"
                  >
                    {item.name}
                  </button>
                );
              }

              // 페이지 이동
              return (
                <Link
                  key={index}
                  to={item.href}
                  className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  role="menuitem"
                  onClick={handleItemClick}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
