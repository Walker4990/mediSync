import Home from "./pages/admin/Home";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccountRegiForm from "./pages/admin/AccountRegiForm";
import AccountList from "./pages/admin/AccountList";
import DashBoard from "./pages/admin/DashBoard";
import PatientList from "./pages/admin/PatientList";
import StaffList from "./pages/admin/StaffList";
import DoctorList from "./pages/admin/DoctorList";
import MyPage from "./pages/user/MyPage";
import RegisterAPI from "./pages/user/RegisterAPI";
import LoginPage from "./pages/user/LoginPage";
import UserHome from "./pages/user/UserHome";
import MedicalConsult from "./pages/user/MedicalConsult";
import MediHistory from "./pages/admin/MediHistory";
import MedicalRecordPage from "./pages/admin/MedicalRecordPage";
import DrugPage from "./pages/admin/DrugPage";
import Reservation from "./pages/user/Reservation";
import TestReservationPage from "./pages/admin/TestReservationPage";
import TestGroupPage from "./component/TestGroupPage";
import ImagingTestPage from "./pages/admin/ImagingTestPage";
import EndoscopeTestPage from "./pages/admin/EndoscopeTestPage";
import BasicTestPage from "./pages/admin/BasicTestPage";
import OtherTestPage from "./pages/admin/OtherTestPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*관리자 페이지*/}
        <Route path="/admin" element={<Home />} />
        <Route path="/admin/register" element={<AccountRegiForm />} />
        <Route path="/admin/acclist" element={<AccountList />} />
        <Route path="/admin/dashboard" element={<DashBoard />} />
        <Route path="/admin/patients" element={<PatientList />} />
        <Route path="/admin/staff" element={<StaffList />} />
        <Route path="/admin/doctor" element={<DoctorList />} />
        <Route path="/admin/history" element={<MediHistory />} />
        <Route path="/admin/medicalRecord" element={<MedicalRecordPage />} />
        <Route path="/admin/drug" element={<DrugPage />} />
        <Route
          path="/admin/test/reservation"
          element={<TestReservationPage />}
        />
        <Route path="/admin/test/imaging" element={<ImagingTestPage />} />
        <Route path="/admin/test/endoscope" element={<EndoscopeTestPage />} />
        <Route path="/admin/test/basic" element={<BasicTestPage />} />
        <Route path="/admin/test/other" element={<OtherTestPage />} />
        {/*유저페이지*/}
        <Route path="/" element={<UserHome />} />/
        <Route path="/user/register" element={<RegisterAPI />} />
        <Route path="/user/login" element={<LoginPage />} />
        <Route path="/user/mypage" element={<MyPage />} />
        <Route path="/user/consult" element={<MedicalConsult />} />
        <Route path="/user/reservation" element={<Reservation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
