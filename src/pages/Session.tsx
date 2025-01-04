import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchBar } from "@/components/MusicSession/SearchBar";
import { MusicPlayer } from "@/components/MusicSession/MusicPlayer";
import { useMusicSession } from "@/contexts/MusicSessionContext";
import { useSessionChat } from "@/hooks/useSessionChat";
import { MessageSquare, Music } from "lucide-react";
import { SearchResults } from "@/components/MusicSession/SearchResults";
import { Track } from "@/types/session";
import { toast } from "sonner";
import { SessionHeader } from "@/components/MusicSession/SessionHeader";
import { ChatPanel } from "@/components/MusicSession/ChatPanel";

const Session = () => {
  const { sessionId } = useParams();
  const {
    currentSession,
    currentTrack,
    isPlaying,
    setIsPlaying,
    searchTracks,
  } = useMusicSession();
  
  const { messages, sendMessage } = useSessionChat(Number(sessionId));
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("recommendations");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);

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

  if (!currentSession || !sessionId) {
    return <div>Session not found</div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto py-8 grid grid-cols-12 gap-6">
        <SessionHeader sessionId={sessionId} />
        
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
            <TabsContent value="recommendations">
              <SearchResults 
                tracks={searchResults} 
                onSelectTrack={handleSelectTrack} 
              />
            </TabsContent>
            <TabsContent value="analysis">
              <div className="text-center text-gray-400">
                Session analysis will appear here
              </div>
            </TabsContent>
            <TabsContent value="lyrics">
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
          <ChatPanel
            messages={messages}
            onSendMessage={sendMessage}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
          />
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