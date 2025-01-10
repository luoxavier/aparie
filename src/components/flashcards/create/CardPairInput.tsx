import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus } from "lucide-react";
import { KeyboardEvent } from "react";

interface CardPair {
  front: string;
  back: string;
}

interface CardPairInputProps {
  index: number;
  card: CardPair;
  updateCard: (index: number, field: keyof CardPair, value: string) => void;
  removeCard: (index: number) => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>, index: number, field: keyof CardPair) => void;
  showRemoveButton: boolean;
}

export function CardPairInput({
  index,
  card,
  updateCard,
  removeCard,
  handleKeyPress,
  showRemoveButton
}: CardPairInputProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid grid-cols-2 gap-4 flex-1">
        <Input
          id={`front-${index}`}
          value={card.front}
          onChange={(e) => updateCard(index, "front", e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, index, "front")}
          placeholder="Front text"
          required
        />
        <Input
          id={`back-${index}`}
          value={card.back}
          onChange={(e) => updateCard(index, "back", e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, index, "back")}
          placeholder="Back text"
          required
        />
      </div>
      {showRemoveButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => removeCard(index)}
          className="text-red-500 hover:text-red-700"
        >
          <Minus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}