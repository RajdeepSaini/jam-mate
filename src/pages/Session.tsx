import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchBar } from "@/components/MusicSession/SearchBar";
import { MusicPlayer } from "@/components/MusicSession/MusicPlayer";
import { useMusicSession } from "@/contexts/MusicSessionContext";
import { useSessionChat } from "@/hooks/useSessionChat";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchResults } from "@/components/MusicSession/SearchResults";
import { Track } from "@/types/session";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChatSection } from "@/components/MusicSession/ChatSection";
import { searchTracks } from "@/services/spotify";

const Session = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    currentSession,
    currentTrack,
    isPlaying,
    setIsPlaying,
  } = useMusicSession();
  
  const { messages, sendMessage } = useSessionChat(sessionId || '');
  const [activeTab, setActiveTab] = useState("recommendations");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to access this page');
        navigate('/login');
        return;
      }

      // Load recommendations based on user's profile
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('favorite_genres')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

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
    
    checkAuth();
  }, [navigate]);

  const handleAddToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
    toast.success(`Added "${track.title}" to queue`);
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

  const handleSendMessage = async (message: string) => {
    const success = await sendMessage(message);
    if (!success) {
      toast.error('Failed to send message');
    }
  };

  if (!currentSession) {
    return <div>Session not found</div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto py-8 grid grid-cols-12 gap-6">
        <div className="col-span-3 glass-morphism p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Music className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Search Songs</h2>
          </div>
          <SearchBar onSearch={handleSearch} placeholder="Search for songs..." />
          <SearchResults tracks={searchResults} onSelectTrack={handleSelectTrack} />
        </div>

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

        <div className="col-span-3">
          <ChatSection messages={messages} onSendMessage={handleSendMessage} />
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