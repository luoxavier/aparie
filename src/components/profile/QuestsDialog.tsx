import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, ListCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestList } from "../quests/QuestList";

export function QuestsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
        >
          <Award className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListCheck className="h-5 w-5" />
            Daily Quests
          </DialogTitle>
        </DialogHeader>
        <QuestList />
      </DialogContent>
    </Dialog>
  );
}