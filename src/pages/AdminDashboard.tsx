import { PageContainer } from "@/components/ui/page-container";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users.");
        } else {
          setUsers(data || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching users:", err);
        toast.error("Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handlePromote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", id);

      if (error) {
        console.error("Error promoting user:", error);
        toast.error("Failed to promote user.");
      } else {
        setUsers(users.map(user => user.id === id ? { ...user, is_admin: true } : user));
        toast.success("User promoted to admin!");
      }
    } catch (err) {
      console.error("Unexpected error promoting user:", err);
      toast.error("Failed to promote user.");
    }
  };

  const handleDemote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: false })
        .eq("id", id);

      if (error) {
        console.error("Error demoting user:", error);
        toast.error("Failed to demote user.");
      } else {
        setUsers(users.map(user => user.id === id ? { ...user, is_admin: false } : user));
        toast.success("User demoted from admin!");
      }
    } catch (err) {
      console.error("Unexpected error demoting user:", err);
      toast.error("Failed to demote user.");
    }
  };

  return (
    <PageContainer>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        {isLoading ? (
          <p>Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Display Name</th>
                  <th className="py-2 px-4 border-b">Username</th>
                  <th className="py-2 px-4 border-b">Is Admin</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{user.id}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">{user.display_name}</td>
                    <td className="py-2 px-4 border-b">{user.username}</td>
                    <td className="py-2 px-4 border-b">{user.is_admin ? "Yes" : "No"}</td>
                    <td className="py-2 px-4 border-b">
                      {!user.is_admin ? (
                        <Button onClick={() => handlePromote(user.id)} variant="secondary">
                          Promote
                        </Button>
                      ) : (
                        <Button onClick={() => handleDemote(user.id)} variant="destructive">
                          Demote
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
