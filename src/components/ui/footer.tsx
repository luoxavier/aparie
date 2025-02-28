
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t py-4 px-6 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="mb-4 md:mb-0">
          © {currentYear} Flashcard App. All rights reserved.
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
