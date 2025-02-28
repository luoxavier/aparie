
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)} 
        className="mb-6"
      >
        Back
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: {currentDate}</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p>
            This Privacy Policy describes how we collect, use, and share your personal information 
            when you use our flashcard application. We respect your privacy and are committed 
            to protecting your personal data.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Account information (email address, username, display name)</li>
            <li>User content (flashcards, playlists, study progress)</li>
            <li>Usage data (how you interact with our application)</li>
            <li>Technical data (IP address, browser type, device information)</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide, maintain, and improve our application</li>
            <li>Process and complete transactions</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends, usage, and activities</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from 
            unauthorized access, alteration, disclosure, or destruction. However, no method of 
            transmission over the Internet or electronic storage is 100% secure, and we cannot 
            guarantee absolute security.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access to your personal data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Restriction or objection to our processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p className="mt-2">To exercise these rights, please contact us.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us at:
            [Your Contact Information]
          </p>
        </section>
      </div>
    </div>
  );
}
