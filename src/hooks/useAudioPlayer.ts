
import { useState, useEffect, useRef } from "react";
import { Track } from "@/types/session";
import { downloadTrack, getStoredTrack, getTrackUrl } from "@/services/tracks";
import { toast } from "sonner";

export const useAudioPlayer = (currentTrack: Track | undefined, isPlaying: boolean, volume: number[]) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (audio) {
      if (isPlaying) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, audio]);

  const loadTrack = async (track: Track) => {
    try {
      setIsLoading(true);
      
      // Check if track is already stored
      let storedTrack = null;
      try {
        storedTrack = await getStoredTrack(track.id);
      } catch (error) {
        console.log("Track not stored yet, will download");
      }
      
      if (!storedTrack) {
        // Download the track if it's not stored
        toast.info(`Downloading "${track.title}"...`);
        const filePath = await downloadTrack(track);
        storedTrack = await getStoredTrack(track.id);
      }

      // Get the public URL for the track
      const publicUrl = await getTrackUrl(storedTrack.file_path);
      
      // Clean up old audio element
      if (audio) {
        audio.pause();
        audio.src = "";
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
      
      // Create and configure audio element
      const newAudio = new Audio(publicUrl);
      newAudio.volume = volume[0] / 100;
      
      // Setup progress tracking
      progressIntervalRef.current = window.setInterval(() => {
        if (newAudio.duration) {
          setProgress((newAudio.currentTime / newAudio.duration) * 100);
        }
      }, 1000);
      
      setAudio(newAudio);
      setProgress(0);
      
      if (isPlaying) {
        newAudio.play();
      }
      
      toast.success(`Now playing: ${track.title}`);
    } catch (error) {
      console.error('Error loading track:', error);
      toast.error("Failed to load track");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audio && audio.duration) {
      const newTime = (value[0] / 100) * audio.duration;
      audio.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  return {
    audio,
    isLoading,
    progress,
    setProgress,
    handleProgressChange,
    onEnded: () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };
};
