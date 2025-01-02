import { useState } from "react";
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

  if (!currentSession) {
    return <div>Session not found</div>;
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
    }
  };

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
              <div className="text-center text-gray-400">
                Song recommendations will appear here
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
                      {message.userId.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{message.userId}</span>
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
      />
    </div>
  );
};

export default Session;