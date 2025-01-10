import { Profile } from "./database";

export interface Creator extends Profile {
  id: string;
  username: string | null;
  display_name: string;
}

export interface Flashcard {
  id: string;
  creator_id: string;
  recipient_id: string | null;
  folder_name: string | null;
  front: string;
  back: string;
  created_at: string;
  updated_at: string;
  creator: Creator;
}

export interface GroupedFlashcards {
  [creatorId: string]: {
    creator: Creator;
    folders: {
      [folderName: string]: Flashcard[];
    };
  };
}