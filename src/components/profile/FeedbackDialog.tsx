import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function FeedbackDialog() {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"bug" | "suggestion" | "other">("suggestion");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      // First, save to database
      const { error: dbError } = await supabase
        .from('user_feedback')
        .insert([
          {
            user_id: user.id,
            type,
            content: content.trim()
          }
        ]);

      if (dbError) throw dbError;

      // Then, send to Discord
      const { error: discordError } = await supabase.functions.invoke('send-feedback-discord', {
        body: {
          type,
          content: content.trim(),
          userEmail: user.email
        }
      });

      if (discordError) {
        console.error('Error sending to Discord:', discordError);
        // Don't throw here, as we still saved to DB successfully
      }

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
      });

      setContent("");
      setType("suggestion");
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className={`gap-2 fixed ${isMobile ? 'bottom-20' : 'bottom-4'} right-4 shadow-lg z-10`}
        >
          <MessageSquare className="h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Type of Feedback</Label>
            <RadioGroup
              value={type}
              onValueChange={(value: "bug" | "suggestion" | "other") => setType(value)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bug" id="bug" />
                <Label htmlFor="bug">Bug</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suggestion" id="suggestion" />
                <Label htmlFor="suggestion">Suggestion</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell us what's on your mind..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="w-full md:w-auto"
          >
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}