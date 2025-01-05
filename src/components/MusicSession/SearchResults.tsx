import { Card, CardContent } from "@/components/ui/card";
import { Track } from "@/types/session";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResultsProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
}

export const SearchResults = ({ tracks, onSelectTrack }: SearchResultsProps) => {
  if (!tracks?.length) return null;

  return (
    <ScrollArea className="h-[400px] mt-4">
      <div className="space-y-2 pr-4">
        {tracks.map((track) => (
          <Card key={track.id} className="hover:bg-accent cursor-pointer" onClick={() => onSelectTrack(track)}>
            <CardContent className="flex items-center gap-4 p-4">
              <img src={track.albumArt} alt={track.title} className="w-12 h-12 rounded" />
              <div className="flex-1 text-left">
                <h3 className="font-medium">{track.title}</h3>
                <p className="text-sm text-gray-500">{track.artist}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};