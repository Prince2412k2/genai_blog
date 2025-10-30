// Edge Function: get-blog
// Assumptions:
// - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are available as environment variables (they are auto-populated in Supabase).
// - FRONTEND_URL env var can be set for CORS; if absent, defaults to '*'.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get('FRONTEND_URL') ?? '*',
  "Access-Control-Allow-Methods": 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const url = new URL(req.url);
    let id = url.searchParams.get('id');
    if (!id) {
      const parts = url.pathname.split('/').filter(Boolean);
      // If last segment is an uuid-like or number, use it
      if (parts.length > 0) {
        id = parts[parts.length - 1];
      }
    }
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing blog id'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Query Supabase REST for single blog by id. Assumes primary key column is 'id'.
    const { data: rows, error: fetchError } = await supabase.from('blog').select('*').eq('id', id);
    if (fetchError) {
      return new Response(JSON.stringify({
        success: false,
        error: fetchError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        blog: null
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const blog = rows[0];

    return new Response(JSON.stringify({
      success: true,
      blog: blog
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
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
        'Content-Type': 'application/json'
      }
    });
  }
});
