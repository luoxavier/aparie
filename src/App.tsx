import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import FriendProfile from "@/pages/FriendProfile";
import StudyFolder from "@/pages/StudyFolder";
import CreateFlashcard from "@/pages/CreateFlashcard";
import EditFlashcard from "@/pages/EditFlashcard";
import SharedWithMe from "@/pages/SharedWithMe";
import Leaderboard from "@/pages/Leaderboard";
import Feedback from "@/pages/Feedback";
import { PrivateRoute } from "@/components/PrivateRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
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
              path="/profile/:userId"
              element={
                <PrivateRoute>
                  <FriendProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/study-folder"
              element={
                <PrivateRoute>
                  <StudyFolder />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-flashcard"
              element={
                <PrivateRoute>
                  <CreateFlashcard />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-flashcard/:id"
              element={
                <PrivateRoute>
                  <EditFlashcard />
                </PrivateRoute>
              }
            />
            <Route
              path="/shared"
              element={
                <PrivateRoute>
                  <SharedWithMe />
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
              path="/feedback"
              element={
                <PrivateRoute>
                  <Feedback />
                </PrivateRoute>
              }
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;