
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FriendSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FriendSearchInput({ 
  value, 
  onChange, 
  placeholder = "Enter friend's username or display name" 
}: FriendSearchInputProps) {
  return (
    <div className="relative mt-3">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 py-3 text-sm md:text-base w-full"
      />
    </div>
  );
}
