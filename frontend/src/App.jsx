import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import OnBoarding from "./Pages/OnBoarding";
import DashBoard from "./Pages/DashBoard";
import AICounsellor from "./Pages/AICounsellor";
import ProtectedRoute from "./Pages/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import SpeechListener from "./Pages/SpeechListener";
import UniversityExplorer from "./Pages/UniversityExplorer";
import UniversityDetail from "./Pages/UniversityDetail";
import ProfileUpdatePage from "./Pages/ProfileUpdatePage";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/speech-listener" element={<SpeechListener />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnBoarding />} />
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/counsellor" element={<AICounsellor />} />
          </Route>
          <Route path="/universities" element={<UniversityExplorer />} />
          <Route path="/university/:id" element={<UniversityDetail />} />
          <Route path="/profile-update" element={<ProfileUpdatePage />} />
        </Routes>


      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
