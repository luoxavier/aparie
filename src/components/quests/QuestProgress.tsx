import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Award } from "lucide-react";
import { motion } from "framer-motion";

interface QuestProgressProps {
  title: string;
  description: string;
  progress: number;
  total: number;
  xpReward: number;
  completed: boolean;
}

export function QuestProgress({
  title,
  description,
  progress,
  total,
  xpReward,
  completed,
}: QuestProgressProps) {
  const progressPercentage = Math.min((progress / total) * 100, 100);

  return (
    <motion.div 
      className={`space-y-2 p-4 rounded-lg transition-all duration-300 ${
        completed ? 'bg-primary/5 animate-in fade-in' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium flex items-center gap-2">
            {title}
            {completed && (
              <CheckCircle2 className="h-4 w-4 text-primary animate-in fade-in" />
            )}
          </h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className={`text-xs ${
            completed ? 'text-primary font-medium' : 'text-muted-foreground'
          }`}>
            {completed ? `+${xpReward} XP Earned!` : `+${xpReward} XP`}
          </p>
        </div>
        {completed && (
          <Award className="h-5 w-5 text-primary animate-sparkle" />
        )}
      </div>
      <div className="space-y-1">
        <Progress 
          value={progressPercentage} 
          className={`h-2 transition-all duration-1000 ease-out ${
            completed ? 'bg-primary/20' : ''
          }`}
        />
        <p className="text-xs text-muted-foreground text-right">
          {progress} / {total}
        </p>
      </div>
    </motion.div>
  );
}