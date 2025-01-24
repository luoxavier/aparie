import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import AppRoutes from "./AppRoutes";
import { FeedbackDialog } from "./components/profile/FeedbackDialog";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
          <FeedbackDialog />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;