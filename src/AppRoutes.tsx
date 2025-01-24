import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Profile";
import Study from "./pages/Study";
import StudyMode from "./pages/StudyMode";
import Friends from "./pages/Friends";
import FriendProfile from "./pages/FriendProfile";
import ProfileEdit from "./pages/ProfileEdit";
import Leaderboard from "./pages/Leaderboard";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
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
        path="/study/:mode"
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
        path="/profile/edit"
        element={
          <PrivateRoute>
            <ProfileEdit />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <PrivateRoute>
            <FriendProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/leaderboard/:creatorId/:playlistName"
        element={
          <PrivateRoute>
            <Leaderboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}