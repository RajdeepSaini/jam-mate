import { supabase } from "@/integrations/supabase/client";

const getSpotifyCredentials = async () => {
  const { data: { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } } = await supabase.functions.invoke('get-spotify-credentials');
  return { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET };
};

const getAccessToken = async () => {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = await getSpotifyCredentials();
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
};

export const searchTracks = async (query: string) => {
  const accessToken = await getAccessToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();
  return data.tracks.items.map((track: any) => ({
    id: track.id,
    title: track.name,
    artist: track.artists[0].name,
    albumArt: track.album.images[0]?.url,
    duration: track.duration_ms,
    uri: track.uri
  }));
};