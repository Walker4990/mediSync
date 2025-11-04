import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function UserLayout() {
  {
    /* 유저 페이지에만 표시될 레이아웃 설정 */
  }

  return (
    <div className="flex flex-col min-h-screen font-pretendard bg-gray-50">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full pt-16 pb-12 px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
