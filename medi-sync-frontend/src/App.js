import Home from "./pages/admin/Home";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PatientList from "./pages/admin/PatientList";
import Register from "./pages/user/Register";
import UserHome from "./pages/user/UserHome";
import MedicalRecordPage from "./pages/admin/MedicalRecordPage";

function App() {
   return ( <BrowserRouter>
        <Routes>
            {/*관리자 페이지*/}
            <Route path="/admin" element={<Home />} />
            <Route path="/admin/patients" element={<PatientList />} />
            <Route path="/admin/medicalRecord" element={<MedicalRecordPage />} />
            {/*유저페이지*/}
            <Route path={"/"} element={<UserHome />} />/
            <Route path={"/register"} element={<Register />} />
        </Routes>
    </BrowserRouter>
);
}

export default App;
