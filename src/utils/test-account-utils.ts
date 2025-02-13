
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const createTestAccount = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
          is_test_account: true,
        },
      },
    });

    if (signUpError) throw signUpError;

    toast({
      title: "Test account created",
      description: `Created test account: ${email}`,
    });

    return signUpData;
  } catch (error: any) {
    console.error('Error creating test account:', error);
    toast({
      variant: "destructive",
      title: "Error creating test account",
      description: error.message,
    });
    throw error;
  }
};

export const deleteAllTestAccounts = async () => {
  try {
    const { error } = await supabase.rpc('delete_test_accounts');
    
    if (error) throw error;

    toast({
      title: "Test accounts deleted",
      description: "All test accounts have been successfully deleted",
    });
  } catch (error: any) {
    console.error('Error deleting test accounts:', error);
    toast({
      variant: "destructive",
      title: "Error deleting test accounts",
      description: error.message,
    });
    throw error;
  }
};

export const generateTestAccountCredentials = (index: number) => {
  const timestamp = new Date().getTime();
  return {
    email: `test${index}_${timestamp}@test.com`,
    password: `Test${timestamp}${index}`,
    username: `test_user_${index}_${timestamp}`,
  };
};

export const createMultipleTestAccounts = async (count: number) => {
  const accounts = [];
  for (let i = 0; i < count; i++) {
    const credentials = generateTestAccountCredentials(i);
    try {
      const account = await createTestAccount(
        credentials.email,
        credentials.password,
        credentials.username
      );
      accounts.push({ ...credentials, ...account });
    } catch (error) {
      console.error(`Failed to create test account ${i}:`, error);
    }
  }
  return accounts;
};
