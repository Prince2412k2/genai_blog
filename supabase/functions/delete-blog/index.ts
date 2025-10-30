import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("FRONTEND_URL"),
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); // correct key
    if (!supabaseUrl || !supabaseKey) {
      return new Response("Supabase env not set", {
        status: 500,
        headers: corsHeaders
      });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({
        error: "Missing blog ID"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // Get logged-in user
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
    // Fetch the blog
    const { data: blog, error: fetchError } = await supabase.from("blog").select("*").eq("id", id).single();
    if (fetchError || !blog) {
      return new Response(JSON.stringify({
        error: "Blog not found"
      }), {
        status: 404,
        headers: corsHeaders
      });
    }
    if (blog.user !== user_id) {
      return new Response(JSON.stringify({
        error: "Unauthorized"
      }), {
        status: 403,
        headers: corsHeaders
      });
    }
    // Delete blog record
    const { error: dbDeleteError } = await supabase.from("blog").delete().eq("id", id);
    if (dbDeleteError) throw dbDeleteError;

    return new Response(JSON.stringify({
      success: true,
      deletedId: id
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
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
