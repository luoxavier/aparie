
import { Route, Routes } from "react-router-dom";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import StudyMode from "@/pages/StudyMode";
import FriendProfile from "@/pages/FriendProfile";
import Study from "@/pages/Study";
import Friends from "@/pages/Friends";
import Leaderboard from "@/pages/Leaderboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import AdminDashboard from "@/pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import ProfileEdit from "./pages/ProfileEdit";
import ErrorBoundary from "./components/ErrorBoundary";

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/profile/edit"
          element={
            <PrivateRoute>
              <ProfileEdit />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/study-mode"
          element={
            <PrivateRoute>
              <StudyMode />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/friends"
          element={
            <PrivateRoute>
              <Friends />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/friends/:username"
          element={
            <PrivateRoute>
              <FriendProfile />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/study/:playlistId"
          element={
            <PrivateRoute>
              <Study />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/leaderboard"
          element={
            <PrivateRoute>
              <Leaderboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <PrivateRoute adminOnly>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}
