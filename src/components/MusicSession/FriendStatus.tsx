import { Badge } from "@/components/ui/badge";

interface FriendStatusProps {
  name: string;
  status: "online" | "offline";
  activity?: string;
  lastSeen?: string;
}

export const FriendStatus = ({ name, status, activity, lastSeen }: FriendStatusProps) => {
  return (
    <div className="glass-morphism p-4 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            {name.charAt(0)}
          </div>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
              status === "online" ? "bg-green-500" : "bg-gray-500"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{name}</h3>
          {status === "online" && activity ? (
            <p className="text-sm text-gray-400 truncate">{activity}</p>
          ) : (
            <p className="text-sm text-gray-400">Last seen {lastSeen}</p>
          )}
        </div>
      </div>
    </div>
  );
};