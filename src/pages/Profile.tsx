import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardsList } from "@/components/profile/FlashcardsList";
import { FriendsList } from "@/components/profile/FriendsList";
import { AddFriendDialog } from "@/components/profile/AddFriendDialog";

export default function Profile() {
  const { signOut } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button onClick={() => signOut()}>Sign Out</Button>
      </div>

      <Tabs defaultValue="flashcards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flashcards">My Flashcards</TabsTrigger>
          <TabsTrigger value="friends">My Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards">
          <FlashcardsList />
        </TabsContent>

        <TabsContent value="friends">
          <AddFriendDialog />
          <div className="mt-4">
            <FriendsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}