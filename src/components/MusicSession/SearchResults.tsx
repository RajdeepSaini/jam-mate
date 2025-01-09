import { Card, CardContent } from "@/components/ui/card";
import { Track } from "@/types/session";
import { uploadTrack } from "@/services/audioStorage";
import { searchYouTube } from "@/services/youtube";
import { toast } from "sonner";

interface SearchResultsProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
}

export const SearchResults = ({ tracks, onSelectTrack }: SearchResultsProps) => {
  const handleTrackSelect = async (track: Track) => {
    try {
      toast.info(`Processing "${track.title}"...`);
      
      // Search YouTube for the track
      const searchQuery = `${track.title} ${track.artist} official audio`;
      const youtubeResults = await searchYouTube(searchQuery);
      
      if (!youtubeResults.length) {
        throw new Error('No YouTube results found');
      }

      // Use the first result (most relevant)
      const youtubeTrack = youtubeResults[0];
      
      // Download and process the track
      await uploadTrack({
        ...track,
        youtubeId: youtubeTrack.id // Add YouTube ID for download
      }, new Blob()); // Placeholder blob, actual download happens in the Edge Function
      
      // Notify the parent component
      onSelectTrack(track);
      toast.success(`Added "${track.title}" to queue`);
    } catch (error) {
      console.error('Failed to process track:', error);
      toast.error('Failed to process track');
    }
  };

  if (!tracks?.length) return null;

  return (
    <div className="space-y-2 mt-4">
      {tracks.map((track) => (
        <Card 
          key={track.id} 
          className="hover:bg-accent cursor-pointer" 
          onClick={() => handleTrackSelect(track)}
        >
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
  );
};