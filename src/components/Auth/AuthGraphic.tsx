import { Disc3, Music2, Sparkles } from "lucide-react";

const AuthGraphic = () => {
  return (
    <div className="hidden lg:flex w-1/2 items-center justify-center relative p-12">
      <div className="text-center space-y-8 relative z-10">
        <div className="animate-[spin_8s_linear_infinite]">
          <Disc3 className="w-48 h-48 text-music-primary opacity-80" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-music-primary to-purple-500 bg-clip-text text-transparent">
            Your Music Journey Starts Here
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Join our community of music lovers and share your favorite tunes with friends
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthGraphic;