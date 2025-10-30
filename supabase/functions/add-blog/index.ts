import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("FRONTEND_URL"),
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return new Response("Supabase env not set", {
        status: 500,
        headers: corsHeaders
      });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Parse request
    const { title, raw, tags } = await req.json();
    if (!title || !raw || !tags) {
      return new Response(JSON.stringify({
        error: "Missing fields"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // Authenticate user
    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({
        error: "Unauthorized"
      }), {
        status: 401,
        headers: corsHeaders
      });
    }
    const user_id = userData.user.id;
    // Insert DB entry
    const { data: blog, error: dbError } = await supabase.from("blog").insert({
      title,
      raw,
      tags,
      user: user_id
    }).select().single();
    if (dbError) throw dbError;

    return new Response(JSON.stringify({
      success: true,
      blog
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
