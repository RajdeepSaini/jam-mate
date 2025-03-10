
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ListMusic, Play } from "lucide-react";
import { Track } from "@/types/session";

interface QueueDrawerProps {
  queue: Track[];
  onPlayTrackFromQueue?: (track: Track) => void;
}

export const QueueDrawer = ({ queue, onPlayTrackFromQueue }: QueueDrawerProps) => {
  return (
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
            {queue.map((track) => (
              <div key={track.id} className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
                <div className="relative">
                  <img src={track.albumArt} alt={track.title} className="h-12 w-12 rounded" />
                  {onPlayTrackFromQueue && (
                    <div 
                      onClick={() => onPlayTrackFromQueue(track)} 
                      className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded flex items-center justify-center cursor-pointer"
                    >
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
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
  );
};
