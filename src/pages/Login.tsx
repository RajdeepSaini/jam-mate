import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SignupForm } from "@/components/Auth/SignupForm";
import { LoginForm } from "@/components/Auth/LoginForm";
import { SocialAuth } from "@/components/Auth/SocialAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music2, Sparkles } from "lucide-react";
import AnimatedBackground from "@/components/Auth/AnimatedBackground";
import AuthGraphic from "@/components/Auth/AuthGraphic";
import { Button } from "@/components/ui/button";

const GENRES = [
  "Pop", "Rock", "Hip Hop", "R&B", "Jazz", "Classical", "Electronic", 
  "Country", "Blues", "Folk", "Metal", "Reggae", "Latin", "World"
];

const Login = () => {
  const navigate = useNavigate();
  const [showGenreSelect, setShowGenreSelect] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError(sessionError.message);
        return;
      }
      if (session) {
        navigate("/");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user?.id) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('favorite_genres')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile error:", profileError);
            setError("Error fetching user profile");
            return;
          }

          if (!profile || !profile.favorite_genres || profile.favorite_genres.length === 0) {
            setShowGenreSelect(true);
          } else {
            toast.success("Successfully signed in!");
            navigate("/");
          }
        } catch (error) {
          console.error("Profile error:", error);
          setError("Error fetching user profile");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGenreSelect = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleGenreSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No user found");
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ favorite_genres: selectedGenres })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }
      
      toast.success("Successfully updated preferences!");
      navigate("/");
    } catch (error) {
      console.error('Error updating genres:', error);
      toast.error("Failed to save preferences");
      setError("Failed to update preferences");
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <AnimatedBackground />
      
      <AuthGraphic />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 relative">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-music-primary">
              <Music2 className="w-8 h-8" />
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome to Jam Mate</h1>
            <p className="text-gray-400">Where music brings people together</p>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="glass-morphism p-6 rounded-xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-music-gray">
                <TabsTrigger value="login" className="data-[state=active]:bg-music-primary">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-music-primary">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-6">
                <LoginForm />
                <SocialAuth />
              </TabsContent>
              
              <TabsContent value="signup">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={showGenreSelect} onOpenChange={setShowGenreSelect}>
        <DialogContent className="sm:max-w-md bg-music-dark border-music-gray">
          <DialogHeader>
            <DialogTitle className="text-music-text">Select Your Favorite Genres</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] px-4">
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-music-primary transition-colors"
                  onClick={() => handleGenreSelect(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleGenreSubmit}
              className="bg-music-primary hover:bg-music-accent"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;