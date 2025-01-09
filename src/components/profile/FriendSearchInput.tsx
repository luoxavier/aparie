import { Input } from "@/components/ui/input";

interface FriendSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FriendSearchInput({ value, onChange, placeholder = "Enter friend's username" }: FriendSearchInputProps) {
  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}