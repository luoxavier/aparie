import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "@/components/PrivateRoute";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import ProfileEdit from "@/pages/ProfileEdit";
import Friends from "@/pages/Friends";
import FriendProfile from "@/pages/FriendProfile";
import Study from "@/pages/Study";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
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
        path="/friends"
        element={
          <PrivateRoute>
            <Friends />
          </PrivateRoute>
        }
      />
      <Route
        path="/friend/:username"
        element={
          <PrivateRoute>
            <FriendProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/study-menu"
        element={
          <PrivateRoute>
            <Study />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}