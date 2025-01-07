import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GENRES = [
  "Pop", "Rock", "Hip Hop", "R&B", "Jazz", "Classical", "Electronic", 
  "Country", "Blues", "Folk", "Metal", "Reggae", "Latin", "World"
];

const Login = () => {
  const navigate = useNavigate();
  const [showGenreSelect, setShowGenreSelect] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      if (!user) throw new Error("No user found");

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ favorite_genres: selectedGenres })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      toast.success("Successfully updated preferences!");
      navigate("/");
    } catch (error) {
      console.error('Error updating genres:', error);
      toast.error("Failed to save preferences");
      setError("Failed to update preferences");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Jam Mate</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
        />

        <Dialog open={showGenreSelect} onOpenChange={setShowGenreSelect}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Your Favorite Genres</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[300px] px-4">
              <div className="grid grid-cols-2 gap-2">
                {GENRES.map((genre) => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleGenreSelect(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end mt-4">
              <Button onClick={handleGenreSubmit}>
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;