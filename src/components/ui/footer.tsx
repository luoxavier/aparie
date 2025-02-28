
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  
  // Check if we're on login or signup page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  return (
    <footer className={`w-full border-t py-4 px-6 mt-auto ${isAuthPage ? 'border-transparent' : ''}`}>
      <div className={`container mx-auto flex flex-col md:flex-row justify-between items-center ${isAuthPage ? 'text-xs' : 'text-sm'} text-gray-500`}>
        <div className="mb-4 md:mb-0">
          © 2025 Aparie. All rights reserved.
        </div>
        {!isAuthPage && (
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
}
