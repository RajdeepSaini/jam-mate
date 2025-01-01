import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SessionCard } from "@/components/MusicSession/SessionCard";
import { MusicPlayer } from "@/components/MusicSession/MusicPlayer";
import { SearchBar } from "@/components/MusicSession/SearchBar";

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock data - replace with real data later
  const sessions = [
    { id: 1, name: "Chill Vibes", participants: 5, currentTrack: "Blinding Lights - The Weeknd" },
    { id: 2, name: "Rock Classics", participants: 3, currentTrack: "Sweet Child O' Mine - Guns N' Roses" },
    { id: 3, name: "Study Session", participants: 8, currentTrack: "Lo-fi beats" },
  ];

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  const handleJoinSession = (sessionId: number) => {
    console.log("Joining session:", sessionId);
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Music Sessions</h1>
          <Button className="bg-music-primary hover:bg-music-accent">
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              name={session.name}
              participants={session.participants}
              currentTrack={session.currentTrack}
              onJoin={() => handleJoinSession(session.id)}
            />
          ))}
        </div>
      </div>

      <MusicPlayer
        currentTrack={{
          title: "Blinding Lights",
          artist: "The Weeknd",
          albumArt: "https://via.placeholder.com/56",
        }}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={() => console.log("Next track")}
        onPrevious={() => console.log("Previous track")}
      />
    </div>
  );
};

export default Index;