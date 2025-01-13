import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, List, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlaylistItemProps {
  playlist: {
    id: string;
    playlist_name: string;
    description: string | null;
    is_public: boolean;
    created_at: string;
    creator: { display_name: string } | null;
    last_modified_by: { display_name: string } | null;
    last_modified_at: string | null;
    modification_history: any[] | null;
  };
}

export function PlaylistItem({ playlist }: PlaylistItemProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          {playlist.playlist_name}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {playlist.is_public ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This playlist is public</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {playlist.description && (
          <p className="text-sm text-muted-foreground mb-2">{playlist.description}</p>
        )}
        <div className="text-xs text-muted-foreground">
          Created by {playlist.creator?.display_name} on{" "}
          {format(new Date(playlist.created_at), "MMM d, yyyy")}
          {playlist.last_modified_by && (
            <>
              <br />
              Last modified by {playlist.last_modified_by.display_name} on{" "}
              {format(new Date(playlist.last_modified_at!), "MMM d, yyyy")}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}