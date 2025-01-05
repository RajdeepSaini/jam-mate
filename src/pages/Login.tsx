import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        // After sign in, check if the user has a username
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session?.user?.id)
          .single();

        if (!profile?.username) {
          // If no username, redirect to profile setup
          navigate("/profile/setup");
        } else {
          toast.success("Successfully signed in!");
          navigate("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-music-dark p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-music-text mb-2">Jam Mate</h1>
          <p className="text-muted-foreground">Join the music revolution</p>
        </div>
        
        <Card className="p-6 backdrop-blur-sm bg-background/80">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#1DB954',
                    brandAccent: '#1ED760',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full bg-music-primary hover:bg-music-accent text-white',
                input: 'bg-background border-music-gray',
              },
            }}
            theme="dark"
            providers={[]}
          />
        </Card>
      </div>
    </div>
  );
};

export default Login;