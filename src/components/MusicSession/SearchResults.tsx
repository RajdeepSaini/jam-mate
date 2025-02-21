import { Card, CardContent } from "@/components/ui/card";
import { Track } from "@/types/session";
import { Play } from "lucide-react";

interface SearchResultsProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
}

export const SearchResults = ({ tracks, onSelectTrack }: SearchResultsProps) => {
  if (!tracks?.length) return null;

  return (
    <div className="space-y-2 mt-4">
      {tracks.map((track) => (
        <Card 
          key={track.id} 
          className="hover:bg-accent cursor-pointer group relative" 
          onClick={() => onSelectTrack(track)}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative">
              <img src={track.albumArt} alt={track.title} className="w-12 h-12 rounded" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium">{track.title}</h3>
              <p className="text-sm text-gray-500">{track.artist}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};