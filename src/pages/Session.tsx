import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchBar } from "@/components/MusicSession/SearchBar";
import { MusicPlayer } from "@/components/MusicSession/MusicPlayer";
import { useMusicSession } from "@/contexts/MusicSessionContext";
import { useSessionChat } from "@/hooks/useSessionChat";
import { MessageSquare, Music, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchResults } from "@/components/MusicSession/SearchResults";
import { Track } from "@/types/session";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Session = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    currentSession,
    currentTrack,
    isPlaying,
    setIsPlaying,
    searchTracks,
  } = useMusicSession();
  
  const { messages, sendMessage } = useSessionChat(sessionId || '');
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("recommendations");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { display_name: string }>>({});

  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('session_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          const { user_id } = payload.new;
          // Fetch user profile if not already cached
          if (!profiles[user_id]) {
            const { data } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', user_id)
              .single();
            
            if (data) {
              setProfiles(prev => ({
                ...prev,
                [user_id]: data
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('favorite_genres')
          .single();

        if (profile?.favorite_genres?.length) {
          const genre = profile.favorite_genres[Math.floor(Math.random() * profile.favorite_genres.length)];
          const results = await searchTracks(genre);
          setRecommendations(results);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
        toast.error('Failed to load recommendations');
      }
    };

    loadRecommendations();
  }, []);

  const handleAddToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
    toast.success(`Added "${track.title}" to queue`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && sessionId) {
      try {
        const { error } = await supabase
          .from('session_messages')
          .insert({
            session_id: sessionId,
            message: messageInput.trim(),
          });

        if (error) throw error;
        setMessageInput("");
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      }
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const results = await searchTracks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tracks:', error);
      toast.error('Failed to search tracks');
    }
  };

  const handleSelectTrack = (track: Track) => {
    handleAddToQueue(track);
  };

  if (!currentSession) {
    return <div>Session not found</div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto py-8 grid grid-cols-12 gap-6">
        {/* Left Column - Song Search */}
        <div className="col-span-3 glass-morphism p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Music className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Search Songs</h2>
          </div>
          <SearchBar onSearch={handleSearch} placeholder="Search for songs..." />
          <SearchResults tracks={searchResults} onSelectTrack={handleSelectTrack} />
        </div>

        {/* Middle Column - Tabs */}
        <div className="col-span-6 glass-morphism p-4 rounded-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="recommendations" className="flex-1">
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex-1">
                Analysis
              </TabsTrigger>
              <TabsTrigger value="lyrics" className="flex-1">
                Lyrics
              </TabsTrigger>
            </TabsList>
            <TabsContent value="recommendations" className="mt-4">
              <div className="grid gap-4">
                {recommendations.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center gap-4">
                      <img src={track.albumArt} alt={track.title} className="w-12 h-12 rounded" />
                      <div>
                        <h3 className="font-medium">{track.title}</h3>
                        <p className="text-sm text-gray-500">{track.artist}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleAddToQueue(track)}>
                      Add to Queue
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="analysis" className="mt-4">
              <div className="text-center text-gray-400">
                Session analysis will appear here
              </div>
            </TabsContent>
            <TabsContent value="lyrics" className="mt-4">
              <div className="text-center text-gray-400">
                Song lyrics will appear here
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Chat */}
        <div className="col-span-3 glass-morphism p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Session Chat</h2>
          </div>
          <div className="h-[calc(100vh-300px)] flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="mb-4"
                >
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary w-8 h-8 flex items-center justify-center text-primary-foreground">
                      {profiles[message.userId]?.display_name?.charAt(0).toUpperCase() || message.userId.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {profiles[message.userId]?.display_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={() => console.log("Next track")}
        onPrevious={() => console.log("Previous track")}
        queue={queue}
      />
    </div>
  );
};

export default Session;