import Home from "./pages/admin/Home";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashBoard from "./pages/admin/DashBoard";
import PatientList from "./pages/admin/PatientList";
import StaffList from "./pages/admin/StaffList";
import DoctorList from "./pages/admin/DoctorList";
import Register from "./pages/user/Register";
import LoginPage from "./pages/user/LoginPage";
import UserHome from "./pages/user/UserHome";
import MedicalConsult from "./pages/user/MedicalConsult";
import MediHistory from "./pages/admin/MediHistory";
import MedicalRecordPage from "./pages/admin/MedicalRecordPage";
import DrugPage from "./pages/admin/DrugPage";
import Reservation from "./pages/user/Reservation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*관리자 페이지*/}
        <Route path="/admin" element={<Home />} />
        <Route path="/admin/dashboard" element={<DashBoard />} />
        <Route path="/admin/patients" element={<PatientList />} />
        <Route path="/admin/staff" element={<StaffList />} />
        <Route path="/admin/doctor" element={<DoctorList />} />
        <Route path="/admin/history" element={<MediHistory />} />
        <Route path="/admin/medicalRecord" element={<MedicalRecordPage />} />
        <Route path="/admin/drug" element={<DrugPage />} />
        {/*유저페이지*/}
        <Route path={"/"} element={<UserHome />} />/
        <Route path={"/user/register"} element={<Register />} />
        <Route path={"/user/login"} element={<LoginPage />} />
        <Route path={"/consult"} element={<MedicalConsult />} />
        <Route path="/user/reservation" element={<Reservation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
