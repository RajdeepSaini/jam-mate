import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SessionCard } from "@/components/MusicSession/SessionCard";
import { MusicPlayer } from "@/components/MusicSession/MusicPlayer";
import { SearchBar } from "@/components/MusicSession/SearchBar";
import { useMusicSession } from "@/contexts/MusicSessionContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Index = () => {
  const {
    sessions,
    currentSession,
    currentTrack,
    isPlaying,
    createSession,
    joinSession,
    setIsPlaying,
    searchTracks,
  } = useMusicSession();
  const [newSessionName, setNewSessionName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName.trim()) {
      createSession(newSessionName.trim());
      setNewSessionName("");
      setIsCreateDialogOpen(false);
      toast.success("Session created successfully!");
    }
  };

  const handleJoinSession = (sessionId: number) => {
    joinSession(sessionId);
    toast.success("Joined session successfully!");
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Music Sessions</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-music-primary hover:bg-music-accent">
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <Input
                  placeholder="Session Name"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Create
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={searchTracks} />
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

      {currentSession && (
        <MusicPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={() => console.log("Next track")}
          onPrevious={() => console.log("Previous track")}
        />
      )}
    </div>
  );
};

export default Index;