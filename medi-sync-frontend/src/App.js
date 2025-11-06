import Home from "./pages/admin/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "./component/UserLayout";
import ModalProvider from "./component/ModalProvider";
import AccountRegiForm from "./pages/admin/AccountRegiForm";
import AccountList from "./pages/admin/AccountList";
import DashBoard from "./pages/admin/DashBoard";
import PatientList from "./pages/admin/PatientList";
import StaffList from "./pages/admin/StaffList";
import DoctorList from "./pages/admin/DoctorList";
import MyPage from "./pages/user/MyPage";
import UserHome from "./pages/user/UserHome";
import FindAccount from "./pages/user/FindAccount";
import MedicalConsult from "./pages/user/MedicalConsult";
import MediHistory from "./pages/admin/MediHistory";
import MedicalRecordPage from "./pages/admin/MedicalRecordPage";
import Insurance from "./pages/user/Insurance";
import DrugPage from "./pages/admin/DrugPage";
import Reservation from "./pages/user/Reservation";
import TestReservationPage from "./pages/admin/TestReservationPage";
import ImagingTestPage from "./pages/admin/ImagingTestPage";
import EndoscopeTestPage from "./pages/admin/EndoscopeTestPage";
import BasicTestPage from "./pages/admin/BasicTestPage";
import OtherTestPage from "./pages/admin/OtherTestPage";
import { NotificationProvider } from "./context/NotificationContext";
import WebSocketListener from "./component/AddNotification";
import NotificationPanel from "./component/NotificationPanel";
import OperationDetailPage from "./pages/admin/OperationDetailPage";
import OperationListPage from "./pages/admin/OperationListPage";
import MedicalDetail from "./pages/user/MedicalDetail";
import { useLocation } from "react-router-dom";
import AdmissionPage from "./pages/admin/AdmissionPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSchedule from "./pages/admin/AdminSchedule";
import SupportChatPage from "./pages/user/SupportChatPage";
import AdminChatPage from "./pages/admin/AdminChatPage";
import FinanceTransactionPage from "./pages/admin/FinanceTransactionPage";
import AdminMainPage from "./pages/admin/AdminMainPage";

function AppContent() {
  const location = useLocation();
  const hideNotification = location.pathname.startsWith("/user/medicalDetail") ||  location.pathname.startsWith("/admin/finance");
  return (
    <>
      {!hideNotification && <WebSocketListener />}
      {!hideNotification && <NotificationPanel />}

      <ModalProvider>
        <Routes>
          {/*관리자 페이지*/}
          <Route path="/admin" element={<Home />} />
          <Route path="/admin/register" element={<AccountRegiForm />} />
          <Route path="/admin/acclist" element={<AccountList />} />

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
          <Route
            path="/admin/operation/:operationId"
            element={<OperationDetailPage />}
          />
          <Route path="/admin/main" element={<AdminMainPage />} />
          <Route path="/admin/operation" element={<OperationListPage />} />
          <Route path="/admin/admission" element={<AdmissionPage />} />
          <Route path="/admin/schedule" element={<AdminSchedule />} />
          <Route path="/admin/chat" element={<AdminChatPage />} />
          <Route path="/admin/finance" element={<FinanceTransactionPage />} />
          <Route path="/admin/finance/dashboard" element={<DashBoard />} />
          {/*유저페이지*/}
          <Route element={<UserLayout />}>
            <Route path="/" element={<UserHome />} />/
            <Route path="/findAccount" element={<FindAccount />} />/
            <Route path="/user/mypage" element={<MyPage />} />
            <Route path="/user/consult" element={<MedicalConsult />} />
            <Route path="/user/reservation" element={<Reservation />} />
            <Route path="/user/insurance" element={<Insurance />} />
            <Route path="/user/support" element={<SupportChatPage />} />
          </Route>
          {/*새창 열림*/}
          <Route
            path="/user/medicalDetail/:recordId"
            element={<MedicalDetail />}
          ></Route>
        </Routes>
      </ModalProvider>
      <ToastContainer position="top-right" autoClose={6000} theme="colored" />
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </NotificationProvider>
  );
}
