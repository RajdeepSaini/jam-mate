import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Globe, Lock } from "lucide-react";
import { useMusicSession } from "@/contexts/MusicSessionContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserMenu } from "@/components/Layout/UserMenu";

const Index = () => {
  const { createSession, joinSession } = useMusicSession();
  const [newSessionName, setNewSessionName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        setUsername(profile.username || '');
        setAvatarUrl(profile.avatar_url || '');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName.trim()) {
      try {
        await createSession(newSessionName.trim(), isPublic);
        setNewSessionName("");
        setIsCreateDialogOpen(false);
        toast.success("Session created successfully!");
      } catch (error) {
        toast.error("Failed to create session");
      }
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionIdInput.trim()) {
      try {
        await joinSession(sessionIdInput.trim());
        setSessionIdInput("");
        toast.success("Joined session successfully!");
      } catch (error) {
        toast.error("Failed to join session. Please check the session ID.");
      }
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
            <UserMenu username={username} avatarUrl={avatarUrl} />
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
          </div>
        </div>

        <div className="max-w-md mx-auto mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Join a Session</h2>
            <form onSubmit={handleJoinSession} className="space-y-4">
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
                Join Session
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;