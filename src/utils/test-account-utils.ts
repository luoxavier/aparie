
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

export const getTestAccounts = async () => {
  try {
    const { data: testAccounts, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('is_test_account', true);

    if (error) throw error;
    return testAccounts;
  } catch (error: any) {
    console.error('Error fetching test accounts:', error);
    throw error;
  }
};

export const deleteAllTestAccounts = async () => {
  try {
    // First get all test accounts
    const testAccounts = await getTestAccounts();
    
    if (!testAccounts || testAccounts.length === 0) {
      toast({
        title: "No test accounts found",
        description: "There are no test accounts to delete.",
      });
      return;
    }

    // Show confirmation with list of accounts
    const confirmMessage = `The following test accounts will be deleted:\n${
      testAccounts.map(account => `- ${account.username}`).join('\n')
    }\n\nAre you sure you want to proceed?`;

    if (!confirm(confirmMessage)) {
      toast({
        title: "Deletion cancelled",
        description: "No test accounts were deleted.",
      });
      return;
    }

    const { error } = await supabase.rpc('delete_test_accounts');
    
    if (error) throw error;

    toast({
      title: "Test accounts deleted",
      description: `Successfully deleted ${testAccounts.length} test account(s)`,
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
