import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { StudyMode } from "@/components/profile/StudyMode";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
}

export default function StudyFolder() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { flashcards, folderName, creatorName } = location.state || { 
    flashcards: [], 
    folderName: "Untitled",
    creatorName: ""
  };

  if (!flashcards.length) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No flashcards found</h1>
          <ReturnHomeButton />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{folderName}</h1>
        {creatorName && (
          <p className="text-sm text-muted-foreground mt-1">Created by {creatorName}</p>
        )}
      </div>

      <StudyMode 
        deck={flashcards}
        onExit={() => navigate("/profile")}
      />
    </div>
  );
}