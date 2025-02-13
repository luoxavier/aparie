import { wipeAllUserData } from "@/utils/test-account-utils";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    wipeAllUserData();
    if (!user) {
      navigate('/login');
    } else {
      navigate('/home');
    }
  }, [user, navigate]);

  return null;
}
