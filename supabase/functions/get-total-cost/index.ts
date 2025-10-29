import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("FRONTEND_URL") ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    const { data, error } = await supabase
      .from("generation")
      .select("total_cost, input_tokens, output_tokens")
      .eq("user", user_id);

    if (error) {
      throw new Error(error.message);
    }

    const totalCost = data.reduce((sum, entry) => sum + (entry.total_cost || 0), 0);
    const totalInputTokens = data.reduce((sum, entry) => sum + (entry.input_tokens || 0), 0);
    const totalOutputTokens = data.reduce((sum, entry) => sum + (entry.output_tokens || 0), 0);

    return new Response(JSON.stringify({
      success: true,
      totalCost,
      totalInputTokens,
      totalOutputTokens
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
