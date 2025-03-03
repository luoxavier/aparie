
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
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";

// Simple fallback component to show when auth errors occur
const AuthErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="w-full max-w-md p-6">
      <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
      <p className="mb-6">
        We're having trouble with the authentication system. Please try again or contact support if the issue persists.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.href = "/login"} variant="default" className="w-full">
          Go to Login
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
          Refresh Page
        </Button>
      </div>
    </Card>
  </div>
);

export default function AppRoutes() {
  return (
    <ErrorBoundary fallback={<AuthErrorFallback />}>
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
          path="/study"
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
