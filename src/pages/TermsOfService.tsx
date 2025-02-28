
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
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
      
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: {currentDate}</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
          <p>
            By accessing or using our flashcard application, you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you do not have permission to access or use the application.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p>
            Our application provides users with tools to create, share, and study flashcards. 
            We reserve the right to modify, suspend, or discontinue the service at any time without notice.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <p>
            To use certain features of the application, you must register for an account. 
            You are responsible for maintaining the confidentiality of your account information 
            and for all activities that occur under your account.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">4. User Content</h2>
          <p>
            You retain all rights to the content you create, but grant us a license to use, 
            reproduce, and display your content in connection with providing the service. 
            You are solely responsible for the content you create and share.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use the service for any illegal purpose</li>
            <li>Violate any laws in your jurisdiction</li>
            <li>Infringe upon the rights of others</li>
            <li>Share inappropriate or offensive content</li>
            <li>Attempt to gain unauthorized access to the service</li>
            <li>Interfere with the proper operation of the service</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages resulting from your use 
            of or inability to use the service.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will provide notice 
            of significant changes. Your continued use of the application after such modifications 
            constitutes your acceptance of the updated terms.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            [Your Contact Information]
          </p>
        </section>
      </div>
    </div>
  );
}
