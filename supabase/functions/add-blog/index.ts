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
    const blogId = crypto.randomUUID();
    const rawFileName = `${blogId}.json`;
    // Upload blog JSON
    const { error: rawUploadError } = await supabase.storage.from("blogs").upload(rawFileName, JSON.stringify(raw), {
      contentType: "application/json"
    });
    if (rawUploadError) throw rawUploadError;
    // Insert DB entry
    const { data: blog, error: dbError } = await supabase.from("blog").insert({
      id: blogId,
      title,
      raw: rawFileName,
      tags,
      user: user_id
    }).select().single();
    if (dbError) throw dbError;
    // Update score.json
    const scoreFileName = "score.json";
    let score = {
      total: 0,
      blogIds: []
    };
    const { data: existingScoreFile, error: downloadError } = await supabase.storage.from("blogs").download(scoreFileName);
    if (!downloadError && existingScoreFile) {
      try {
        const text = await existingScoreFile.text();
        score = JSON.parse(text);
      } catch (_) {
        console.warn("Malformed score.json, resetting...");
      }
    }
    score.total += 1;
    score.blogIds.push({
      title,
      blogId,
      tags
    });
    const { error: scoreUploadError } = await supabase.storage.from("blogs").upload(scoreFileName, JSON.stringify(score, null, 2), {
      contentType: "application/json",
      upsert: true
    });
    if (scoreUploadError) throw scoreUploadError;
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
