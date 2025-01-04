import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Globe, Lock, Users } from "lucide-react";
import { SessionCard } from "@/components/MusicSession/SessionCard";
import { SearchBar } from "@/components/MusicSession/SearchBar";
import { useMusicSession } from "@/contexts/MusicSessionContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FriendStatus } from "@/components/MusicSession/FriendStatus";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const {
    sessions,
    createSession,
    joinSession,
    searchSessions,
  } = useMusicSession();
  
  const [newSessionName, setNewSessionName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.username) {
        setUsername(profile.username);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName.trim()) {
      const sessionId = createSession(newSessionName.trim(), isPublic);
      setNewSessionName("");
      setIsCreateDialogOpen(false);
      toast.success("Session created successfully!");
      navigate(`/session/${sessionId}`);
    }
  };

  const handleJoinSession = (sessionId: number) => {
    joinSession(sessionId);
    toast.success("Joined session successfully!");
    navigate(`/session/${sessionId}`);
  };

  const handleJoinPrivateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionId = parseInt(sessionIdInput);
    if (!isNaN(sessionId)) {
      handleJoinSession(sessionId);
    } else {
      toast.error("Invalid session ID");
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Music Sessions</h1>
            <p className="text-gray-600 mt-2">Welcome{username ? `, ${username}` : ""}! Ready to jam?</p>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
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
                  <div>
                    <Label htmlFor="sessionName">Session Name</Label>
                    <Input
                      id="sessionName"
                      placeholder="Session Name"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant={isPublic ? "default" : "outline"}
                      onClick={() => setIsPublic(true)}
                      className="flex-1"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Public
                    </Button>
                    <Button
                      type="button"
                      variant={!isPublic ? "default" : "outline"}
                      onClick={() => setIsPublic(false)}
                      className="flex-1"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Private
                    </Button>
                  </div>
                  <Button type="submit" className="w-full">
                    Create
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Join Private Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Private Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleJoinPrivateSession} className="space-y-4">
                  <div>
                    <Label htmlFor="sessionId">Session ID</Label>
                    <Input
                      id="sessionId"
                      placeholder="Enter session ID"
                      value={sessionIdInput}
                      onChange={(e) => setSessionIdInput(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Join
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={searchSessions} placeholder="Search for sessions..." />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Friends</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <FriendStatus
              name="John Doe"
              status="online"
              activity="Listening to Spotify"
            />
            <FriendStatus
              name="Jane Smith"
              status="online"
              activity="In Session: Chill Vibes"
            />
            <FriendStatus
              name="Mike Johnson"
              status="offline"
              lastSeen="2 hours ago"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              name={session.name}
              participants={session.participants}
              currentTrack={session.currentTrack}
              onJoin={() => handleJoinSession(session.id)}
              isPublic={session.isPublic}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;