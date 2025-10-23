import Home from "./pages/admin/Home";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PatientList from "./pages/admin/PatientList";
import StaffList from "./pages/admin/StaffList";
import DoctorList from "./pages/admin/DoctorList";
import Register from "./pages/user/Register";
import UserHome from "./pages/user/UserHome";
import MedicalRecordPage from "./pages/admin/MedicalRecordPage";
import MediHistory from "./pages/admin/MediHistory";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
