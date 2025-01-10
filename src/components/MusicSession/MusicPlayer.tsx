import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, SkipBack, Volume2, ListMusic } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Track } from "@/types/session";
import { downloadTrack, getStoredTrack, getTrackUrl } from "@/services/tracks";
import { toast } from "sonner";

interface MusicPlayerProps {
  currentTrack?: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  queue?: Track[];
}

export const MusicPlayer = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  queue = [],
}: MusicPlayerProps) => {
  const [volume, setVolume] = useState([100]);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      loadTrack(currentTrack);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audio) {
      audio.volume = volume[0] / 100;
    }
  }, [volume, audio]);

  const loadTrack = async (track: Track) => {
    try {
      setIsLoading(true);
      
      // Check if track is already stored
      let storedTrack = await getStoredTrack(track.id);
      
      if (!storedTrack) {
        // Download the track if it's not stored
        toast.info("Downloading track...");
        const filePath = await downloadTrack(track);
        storedTrack = await getStoredTrack(track.id);
      }

      // Get the public URL for the track
      const publicUrl = await getTrackUrl(storedTrack.file_path);
      
      // Create and configure audio element
      const newAudio = new Audio(publicUrl);
      newAudio.volume = volume[0] / 100;
      
      // Clean up old audio element
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      
      setAudio(newAudio);
      
      if (isPlaying) {
        newAudio.play();
      }
    } catch (error) {
      console.error('Error loading track:', error);
      toast.error("Failed to load track");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (audio) {
      if (isPlaying) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, audio]);

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-morphism p-4 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentTrack && (
            <>
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className="h-14 w-14 rounded-md"
              />
              <div>
                <h3 className="font-semibold">{currentTrack.title}</h3>
                <p className="text-sm text-gray-400">{currentTrack.artist}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="text-gray-400 hover:text-white"
              disabled={isLoading}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPlayPause}
              className="h-10 w-10 rounded-full bg-music-primary hover:bg-music-accent text-white"
              disabled={isLoading}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="text-gray-400 hover:text-white"
              disabled={isLoading}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          <Slider
            defaultValue={[0]}
            max={100}
            step={1}
            className="w-[400px]"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-gray-400" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-[100px]"
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ListMusic className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Queue</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                <div className="space-y-4">
                  {queue.map((track, index) => (
                    <div key={track.id} className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
                      <img src={track.albumArt} alt={track.title} className="h-12 w-12 rounded" />
                      <div>
                        <h4 className="font-medium">{track.title}</h4>
                        <p className="text-sm text-gray-500">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};