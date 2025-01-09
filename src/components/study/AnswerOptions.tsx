import { Button } from "@/components/ui/button";

interface AnswerOptionsProps {
  options: string[];
  onAnswer: (answer: string) => void;
}

export function AnswerOptions({ options, onAnswer }: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-12">
      {options.map((answer, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto py-4 text-left"
          onClick={() => onAnswer(answer)}
        >
          {answer}
        </Button>
      ))}
    </div>
  );
}