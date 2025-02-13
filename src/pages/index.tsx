
import { wipeAllUserData } from "@/utils/test-account-utils";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const init = async () => {
      try {
        // First sign out the current user to clear session
        await signOut();
        // Then wipe all data
        await wipeAllUserData();
        // Finally navigate to login
        navigate('/login');
      } catch (error) {
        console.error('Error in initialization:', error);
        navigate('/login');
      }
    };

    init();
  }, [navigate, signOut]);

  return null;
}
