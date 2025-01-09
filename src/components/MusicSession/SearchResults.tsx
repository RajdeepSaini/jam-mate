import { Card, CardContent } from "@/components/ui/card";
import { Track } from "@/types/session";
import { uploadTrack } from "@/services/audioStorage";
import { toast } from "sonner";

interface SearchResultsProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
}

export const SearchResults = ({ tracks, onSelectTrack }: SearchResultsProps) => {
  const handleTrackSelect = async (track: Track) => {
    try {
      // Here we would normally download the audio file from Spotify
      // For now, we'll simulate it with a dummy MP3 file
      const response = await fetch('/placeholder-audio.mp3');
      const audioBlob = await response.blob();
      
      // Upload the track to storage
      await uploadTrack(track, audioBlob);
      
      // Notify the parent component
      onSelectTrack(track);
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