import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("FRONTEND_URL") ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase env not set");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { id, title, raw } = await req.json();
    if (!id || !title || !raw) {
      return new Response(JSON.stringify({
        error: "Missing fields"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // ✅ Verify blog ownership
    const { data: existingBlog, error: fetchError } = await supabase.from("blog").select("*").eq("id", id).single();
    if (fetchError || !existingBlog) {
      return new Response(JSON.stringify({
        error: "Blog not found"
      }), {
        status: 404,
        headers: corsHeaders
      });
    }
    // ✅ Upload updated content
    const { error: uploadError } = await supabase.storage.from("blogs").upload(existingBlog.raw_path, JSON.stringify(raw), {
      contentType: "application/json",
      upsert: true
    });
    if (uploadError) throw uploadError;
    // ✅ Update DB
    const { data: updatedBlog, error: dbError } = await supabase.from("blog").update({
      title
    }).eq("id", id).select().single();
    if (dbError) throw dbError;
    return new Response(JSON.stringify({
      success: true,
      blog: updatedBlog
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
