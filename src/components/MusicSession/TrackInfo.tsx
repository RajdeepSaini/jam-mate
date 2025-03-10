
import { Track } from "@/types/session";

interface TrackInfoProps {
  currentTrack?: Track;
}

export const TrackInfo = ({ currentTrack }: TrackInfoProps) => {
  if (!currentTrack) {
    return <div className="text-gray-400 text-sm">No track playing</div>;
  }
  
  return (
    <div className="flex items-center gap-3">
      <img
        src={currentTrack.albumArt}
        alt={currentTrack.title}
        className="h-14 w-14 rounded-md shadow-lg object-cover"
      />
      <div className="flex flex-col justify-center">
        <h3 className="font-semibold text-sm md:text-base line-clamp-1">{currentTrack.title}</h3>
        <p className="text-xs md:text-sm text-gray-400 line-clamp-1">{currentTrack.artist}</p>
      </div>
    </div>
  );
};
