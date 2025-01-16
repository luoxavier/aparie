import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/hooks/use-toast";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import ProfileEdit from "@/pages/ProfileEdit";
import PrivateRoute from "@/components/PrivateRoute";
import Study from "@/pages/Study";
import StudyFolder from "@/pages/StudyFolder";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
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
                path="/study"
                element={
                  <PrivateRoute>
                    <Study />
                  </PrivateRoute>
                }
              />
              <Route
                path="/study/:folderId"
                element={
                  <PrivateRoute>
                    <StudyFolder />
                  </PrivateRoute>
                }
              />
            </Routes>
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
