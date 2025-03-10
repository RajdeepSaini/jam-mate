
import { Track } from "@/types/session";
import { Disc3 } from "lucide-react";

interface TrackInfoProps {
  currentTrack?: Track;
}

export const TrackInfo = ({ currentTrack }: TrackInfoProps) => {
  if (!currentTrack) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Disc3 className="h-5 w-5" />
        <span>No track playing</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3">
      {currentTrack.albumArt ? (
        <img
          src={currentTrack.albumArt}
          alt={currentTrack.title}
          className="h-14 w-14 rounded-md shadow-lg object-cover"
        />
      ) : (
        <div className="h-14 w-14 rounded-md shadow-lg bg-slate-800 flex items-center justify-center">
          <Disc3 className="h-8 w-8 text-slate-400" />
        </div>
      )}
      <div className="flex flex-col justify-center">
        <h3 className="font-semibold text-sm md:text-base line-clamp-1">{currentTrack.title}</h3>
        <p className="text-xs md:text-sm text-gray-400 line-clamp-1">{currentTrack.artist}</p>
      </div>
    </div>
  );
};
