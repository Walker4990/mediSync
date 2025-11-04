import { createContext, useContext } from "react";

/**
 * 전역 모달 상태 관리를 위한 Context 객체입니다.
 * 이 파일에서 단 한 번만 createContext()를 호출하고 export 합니다.
 */
const ModalContext = createContext();

export default function useModal() {
  const context = useContext(ModalContext);
  return context;
}

export { ModalContext };
