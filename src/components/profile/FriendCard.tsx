import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";

interface FriendCardProps {
  friend: {
    id: string;
    display_name: string;
    username: string | null;
    avatar_url?: string | null;
  };
}

export function FriendCard({ friend }: FriendCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="w-full justify-start"
              variant="ghost"
            >
              <div className="flex items-center space-x-4">
                {friend.avatar_url && (
                  <img
                    src={friend.avatar_url}
                    alt={friend.display_name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-medium">
                    {friend.display_name}
                    {friend.username && (
                      <span className="text-sm text-muted-foreground ml-1">
                        @{friend.username}
                      </span>
                    )}
                  </h3>
                </div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Create Flashcards for {friend.display_name}
                {friend.username && ` (@${friend.username})`}
              </DialogTitle>
            </DialogHeader>
            <CreateMultipleCards recipientId={friend.id} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}