import { Button } from "@/components/ui/button";
import { Google, Music2, Discord } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SocialAuth = () => {
  const handleSocialLogin = async (provider: 'google' | 'discord' | 'spotify') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-music-gray" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-music-dark px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <Button 
          variant="outline" 
          className="bg-music-gray/50 border-music-gray"
          onClick={() => handleSocialLogin('google')}
        >
          <Google className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button 
          variant="outline" 
          className="bg-music-gray/50 border-music-gray"
          onClick={() => handleSocialLogin('discord')}
        >
          <Discord className="mr-2 h-4 w-4" />
          Discord
        </Button>
        <Button 
          variant="outline" 
          className="bg-music-gray/50 border-music-gray"
          onClick={() => handleSocialLogin('spotify')}
        >
          <Music2 className="mr-2 h-4 w-4" />
          Spotify
        </Button>
      </div>
    </div>
  );
};