
import { Card, CardContent } from "@/components/ui/card";
import { Track } from "@/types/session";
import { Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResultsProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
  onPlayTrack?: (track: Track) => void;
}

export const SearchResults = ({ tracks, onSelectTrack, onPlayTrack }: SearchResultsProps) => {
  if (!tracks?.length) return null;

  return (
    <div className="space-y-2 mt-4">
      {tracks.map((track) => (
        <Card 
          key={track.id} 
          className="hover:bg-accent group relative" 
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative">
              <img src={track.albumArt} alt={track.title} className="w-12 h-12 rounded" />
              <div 
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
                onClick={() => onPlayTrack ? onPlayTrack(track) : onSelectTrack(track)}
              >
                <Play className="w-6 h-6 text-white cursor-pointer" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium">{track.title}</h3>
              <p className="text-sm text-gray-500">{track.artist}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white"
              onClick={() => onSelectTrack(track)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
