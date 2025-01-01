import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchBar } from "@/components/MusicSession/SearchBar";
import { MusicPlayer } from "@/components/MusicSession/MusicPlayer";
import { useMusicSession } from "@/contexts/MusicSessionContext";
import { MessageSquare, Music, BarChart2, MessageCircle } from "lucide-react";

const Session = () => {
  const { sessionId } = useParams();
  const {
    currentSession,
    currentTrack,
    isPlaying,
    setIsPlaying,
    searchTracks,
  } = useMusicSession();
  
  const [activeTab, setActiveTab] = useState("recommendations");

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
          <SearchBar onSearch={searchTracks} placeholder="Search for songs..." />
          <div className="mt-4 space-y-4">
            {/* Song search results will go here */}
          </div>
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
              {/* Recommendations content */}
              <div className="text-center text-gray-400">
                Song recommendations will appear here
              </div>
            </TabsContent>
            <TabsContent value="analysis" className="mt-4">
              {/* Analysis content */}
              <div className="text-center text-gray-400">
                Session analysis will appear here
              </div>
            </TabsContent>
            <TabsContent value="lyrics" className="mt-4">
              {/* Lyrics content */}
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
            <div className="flex-1 overflow-y-auto">
              {/* Chat messages will go here */}
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full p-2 rounded-lg glass-morphism"
              />
            </div>
          </div>
        </div>
      </div>

      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={() => console.log("Next track")}
        onPrevious={() => console.log("Previous track")}
      />
    </div>
  );
};

export default Session;