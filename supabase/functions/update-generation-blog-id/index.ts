import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("FRONTEND_URL") ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

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

    const { generation_id, blog_id } = await req.json();

    if (!generation_id || !blog_id) {
      return new Response(JSON.stringify({
        error: "Missing generation_id or blog_id"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Verify ownership of the generation record
    const { data: generation, error: generationError } = await supabase
      .from("generation")
      .select("user")
      .eq("id", generation_id)
      .single();

    if (generationError || !generation) {
        return new Response(JSON.stringify({ error: "Generation not found" }), { status: 404, headers: corsHeaders });
    }

    if (generation.user !== user_id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: corsHeaders });
    }

    const { error } = await supabase
      .from("generation")
      .update({ blog_id: blog_id })
      .eq("id", generation_id);

    if (error) {
      throw new Error(error.message);
    }

    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
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
