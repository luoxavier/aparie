export interface Friend {
  id: string;
  display_name: string;
}

export interface CardPair {
  front: string;
  back: string;
}

export interface Flashcard extends CardPair {
  id: string;
  creator_id: string;
}