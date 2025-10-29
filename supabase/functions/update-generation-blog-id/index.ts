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

    const { generation_id, blog_id } = await req.json();

    if (!generation_id || !blog_id) {
      return new Response(JSON.stringify({
        error: "Missing generation_id or blog_id"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { error } = await supabase
      .from("generation")
      .update({ blog: blog_id })
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
