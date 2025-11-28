import React from "react";
import { Eye, EyeOff } from "lucide-react";

// 비밀번호 입력 컴포넌트
const PasswordInput = ({
  name,
  placeholder,
  value,
  onChange,
  disabled,
  showPasswordState,
  toggleVisibilityHandler,
}) => {
  const field = name.replace("Password", "").toLowerCase();
  const isVisible = showPasswordState[field];

  return (
    <div className="relative mb-5">
      <input
        type={isVisible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:ring-red-500"
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => toggleVisibilityHandler(field)}
        className="absolute right-0 flex items-center text-gray-300 hover:text-gray-500 h-full top-0 pr-3"
        aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보이기"}
      >
        {isVisible ? (
          <Eye className="w-5 h-5" />
        ) : (
          <EyeOff className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
