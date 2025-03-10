
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";

interface VolumeControlProps {
  volume: number[];
  onVolumeChange: (values: number[]) => void;
}

export const VolumeControl = ({ volume, onVolumeChange }: VolumeControlProps) => {
  return (
    <div className="flex items-center gap-2">
      <Volume2 className="h-5 w-5 text-gray-400" />
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
