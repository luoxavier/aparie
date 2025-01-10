import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus } from "lucide-react";

interface CardPair {
  id?: string;
  front: string;
  back: string;
}

interface CreateCardFormProps {
  cards: CardPair[];
  onUpdateCard: (index: number, field: keyof CardPair, value: string) => void;
  onRemoveCard: (index: number) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: keyof CardPair) => void;
}

export function CreateCardForm({ cards, onUpdateCard, onRemoveCard, onKeyPress }: CreateCardFormProps) {
  return (
    <div className="space-y-2">
      {cards.map((card, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-4 flex-1">
            <Input
              id={`front-${index}`}
              value={card.front}
              onChange={(e) => onUpdateCard(index, "front", e.target.value)}
              onKeyDown={(e) => onKeyPress(e, index, "front")}
              placeholder="Front text"
              required
            />
            <Input
              id={`back-${index}`}
              value={card.back}
              onChange={(e) => onUpdateCard(index, "back", e.target.value)}
              onKeyDown={(e) => onKeyPress(e, index, "back")}
              placeholder="Back text"
              required
            />
          </div>
          {cards.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemoveCard(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}