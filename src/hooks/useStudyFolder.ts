import { useNavigate } from "react-router-dom";

interface Creator {
  display_name: string;
  username: string | null;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
  creator: Creator;
}

export function useStudyFolder() {
  const navigate = useNavigate();

  const handleStudy = (
    e: React.MouseEvent,
    flashcards: Flashcard[],
    title: string,
    creatorName?: string
  ) => {
    e.stopPropagation();
    navigate('/study-folder', { 
      state: { 
        flashcards, 
        folderName: title,
        creatorName
      } 
    });
  };

  return { handleStudy };
}