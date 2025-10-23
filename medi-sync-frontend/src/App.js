import Home from "./pages/admin/Home";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PatientList from "./pages/admin/PatientList";
import StaffList from "./pages/admin/StaffList";
import DoctorList from "./pages/admin/DoctorList";
import MediHistory from "./pages/admin/MediHistory";
import Register from "./pages/user/Register";
import LoginPage from "./pages/user/LoginPage";
import UserHome from "./pages/user/UserHome";
import MediHistory from "./pages/admin/MediHistory";
import MedicalRecordPage from "./pages/admin/MedicalRecordPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*관리자 페이지*/}
        <Route path="/admin" element={<Home />} />
        <Route path="/admin/patients" element={<PatientList />} />
        <Route path="/admin/staff" element={<StaffList />} />
        <Route path="/admin/doctor" element={<DoctorList />} />
        <Route path="/admin/history" element={<MediHistory />} />
        <Route path="/admin/medicalRecord" element={<MedicalRecordPage />} />
        {/*유저페이지*/}
        <Route path={"/"} element={<UserHome />} />/
        <Route path={"user/register"} element={<Register />} />
        <Route path={"user/login"} element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
