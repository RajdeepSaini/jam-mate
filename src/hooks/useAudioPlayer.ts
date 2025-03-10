
import { useState, useEffect, useRef } from "react";
import { Track } from "@/types/session";
import { downloadTrack, getStoredTrack, getTrackUrl } from "@/services/tracks";
import { toast } from "sonner";

export const useAudioPlayer = (currentTrack: Track | undefined, isPlaying: boolean, volume: number[]) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  useEffect(() => {
    if (currentTrack) {
      loadTrack(currentTrack);
    }
    
    // Cleanup function
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audio) {
      audio.volume = volume[0] / 100;
    }
  }, [volume, audio]);

  useEffect(() => {
    if (audio) {
      if (isPlaying) {
        audio.play().catch(error => {
          console.error("Error playing audio:", error);
          toast.error("Playback failed. Try again.");
        });
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, audio]);

  const loadTrack = async (track: Track) => {
    try {
      setIsLoading(true);
      retryCountRef.current = 0;
      
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
        try {
          const filePath = await downloadTrack(track);
          storedTrack = await getStoredTrack(track.id);
        } catch (error) {
          console.error('Error downloading track:', error);
          toast.error(`Failed to download "${track.title}". Please try again.`);
          setIsLoading(false);
          return;
        }
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
      
      // Add event listeners
      newAudio.addEventListener('ended', () => {
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setProgress(0);
      });
      
      // Error handling
      newAudio.addEventListener('error', (e) => {
        console.error("Audio error:", e);
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          toast.error(`Playback error. Retrying (${retryCountRef.current}/${maxRetries})...`);
          setTimeout(() => loadTrack(track), 1000);
        } else {
          toast.error("Failed to play track after multiple attempts.");
        }
      });
      
      setAudio(newAudio);
      setProgress(0);
      
      if (isPlaying) {
        newAudio.play().catch(error => {
          console.error("Error playing audio:", error);
          toast.error("Playback failed. Try again.");
        });
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
      setProgress(0);
    }
  };
};
