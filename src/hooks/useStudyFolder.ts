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
    flashcards: Flashcard[],
    title: string,
    creatorId: string
  ) => {
    navigate(`/study/${creatorId}/${encodeURIComponent(title)}`);
  };

  return { handleStudy };
}