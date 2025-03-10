
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VolumeControlProps {
  volume: number[];
  onVolumeChange: (values: number[]) => void;
}

export const VolumeControl = ({ volume, onVolumeChange }: VolumeControlProps) => {
  const [previousVolume, setPreviousVolume] = useState<number>(100);
  
  const VolumeIcon = () => {
    if (volume[0] === 0) return <VolumeX className="h-5 w-5 text-gray-400" />;
    if (volume[0] < 33) return <Volume className="h-5 w-5 text-gray-400" />;
    if (volume[0] < 66) return <Volume1 className="h-5 w-5 text-gray-400" />;
    return <Volume2 className="h-5 w-5 text-gray-400" />;
  };
  
  const toggleMute = () => {
    if (volume[0] === 0) {
      // Unmute to previous volume level or default to 70
      onVolumeChange([previousVolume || 70]);
    } else {
      // Save current volume and mute
      setPreviousVolume(volume[0]);
      onVolumeChange([0]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 p-0"
        onClick={toggleMute}
      >
        <VolumeIcon />
      </Button>
      <Slider
        value={volume}
        onValueChange={onVolumeChange}
        max={100}
        step={1}
        className="w-[100px]"
      />
    </div>
  );
};
