
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export function Footer() {
  const location = useLocation();
  
  // Check if we're on login or signup page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // If on auth page, use a more minimal footer
  if (isAuthPage) {
    return (
      <footer className="w-full py-2 px-6 mt-auto">
        <div className="container mx-auto text-center text-xs text-gray-400">
          © 2025 Aparie. All rights reserved.
        </div>
      </footer>
    );
  }
  
  // Regular footer for other pages
  return (
    <footer className="w-full border-t py-4 px-6 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="mb-4 md:mb-0">
          © 2025 Aparie. All rights reserved.
        </div>
        <div className="flex space-x-6">
          <Link to="/privacy-policy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
