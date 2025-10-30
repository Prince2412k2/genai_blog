import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing blog ID" }), { status: 400, headers: corsHeaders });
    }

    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = userData.user.id;

    // 1. Delete from database
    const { error: dbError } = await supabase
      .from("blog")
      .delete()
      .eq("id", id)
      .eq("user", userId);
    if (dbError) throw dbError;

    // 2. Delete from storage
    const { error: storageError } = await supabase.storage.from("blogs").remove([`${id}.json`]);
    if (storageError && !storageError.message.includes("not found")) throw storageError;

    // 3. Update user's blog list
    const userBlogListFile = `${userId}.json`;
    let userBlogData = { title: "My Blog", blogs: [] };
    try {
      const { data: existingList } = await supabase.storage.from("blogs").download(userBlogListFile);
      if (existingList) {
        userBlogData = JSON.parse(await existingList.text());
      }
    } catch (e) {
      // If the list doesn't exist, there's nothing to do
      return new Response(JSON.stringify({ success: true, deletedId: id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    userBlogData.blogs = userBlogData.blogs.filter(blog => blog.id !== id);

    const { error: listUploadError } = await supabase.storage
      .from("blogs")
      .upload(userBlogListFile, JSON.stringify(userBlogData, null, 2), {
        contentType: "application/json",
        upsert: true
      });
    if (listUploadError) throw listUploadError;

    return new Response(JSON.stringify({ success: true, deletedId: id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});