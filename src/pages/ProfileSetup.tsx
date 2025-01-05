import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Music2 } from "lucide-react";

const GENRE_OPTIONS = [
  "Pop", "Rock", "Hip Hop", "R&B", "Jazz", 
  "Classical", "Electronic", "Country", "Metal", "Folk"
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No user found");

      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        toast.error("Username is already taken");
        setLoading(false);
        return;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          favorite_genres: selectedGenres,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast.success("Profile setup complete!");
      navigate("/");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to setup profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-music-dark p-4">
      <Card className="w-full max-w-md p-6 space-y-6 backdrop-blur-sm bg-background/80">
        <div className="space-y-2 text-center">
          <Music2 className="w-12 h-12 mx-auto text-music-primary" />
          <h1 className="text-2xl font-bold text-music-text">Complete Your Profile</h1>
          <p className="text-muted-foreground">Let's personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a unique username"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_-]+$"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label>Favorite Genres</Label>
            <div className="grid grid-cols-2 gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <Button
                  key={genre}
                  type="button"
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleGenreToggle(genre)}
                >
                  {selectedGenres.includes(genre) && (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-music-primary hover:bg-music-accent"
            disabled={loading || !username || selectedGenres.length === 0}
          >
            {loading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfileSetup;