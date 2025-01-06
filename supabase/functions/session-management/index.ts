import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts"
import { corsHeaders } from "../_shared/cors.ts"

const MONGODB_URI = Deno.env.get('MONGODB_URI') || '';
const client = new MongoClient();

interface Session {
  _id?: string;
  name: string;
  code: string;
  created_by: string;
  is_public: boolean;
  current_track?: any;
  is_playing?: boolean;
  participants?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    await client.connect(MONGODB_URI);
    const db = client.database("music_sessions");
    const sessions = db.collection("sessions");

    const { action, ...data } = await req.json();

    switch (action) {
      case 'create': {
        const session: Session = {
          name: data.name,
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          created_by: data.userId,
          is_public: data.isPublic,
          is_playing: false,
          participants: [data.userId],
        };
        const result = await sessions.insertOne(session);
        return new Response(
          JSON.stringify({ ...session, _id: result.toString() }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'join': {
        const result = await sessions.findAndModify(
          { _id: new ObjectId(data.sessionId) },
          {
            update: { $addToSet: { participants: data.userId } },
            new: true
          }
        );
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'leave': {
        await sessions.updateOne(
          { _id: new ObjectId(data.sessionId) },
          { $pull: { participants: data.userId } }
        );
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } finally {
    await client.close();
  }
});