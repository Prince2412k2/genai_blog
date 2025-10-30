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

    const { id, title, raw, tags, content } = await req.json();
    if (!id || !title || !raw || !tags || !content) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: corsHeaders });
    }

    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = userData.user.id;

    // 1. Update database
    const { data: dbBlog, error: dbError } = await supabase
      .from("blog")
      .update({ title, raw, tags })
      .eq("id", id)
      .eq("user", userId) // Ensure ownership
      .select()
      .single();
    if (dbError) throw dbError;

    // 2. Upload ProseMirror JSON to storage
    const blogStorageObject = { title, tags, content };
    const { error: storageError } = await supabase.storage
      .from("blogs")
      .upload(`${id}.json`, JSON.stringify(blogStorageObject, null, 2), {
        contentType: "application/json",
        upsert: true
      });
    if (storageError) throw storageError;

    // 3. Update user's blog list
    const userBlogListFile = `${userId}.json`;
    let userBlogData = { title: "My Blog", blogs: [] };
    try {
      const { data: existingList } = await supabase.storage.from("blogs").download(userBlogListFile);
      if (existingList) {
        userBlogData = JSON.parse(await existingList.text());
      }
    } catch (e) {
      // File might not exist, which is an inconsistent state, but we can recover by creating it.
    }

    const blogIndex = userBlogData.blogs.findIndex(blog => blog.id === id);
    if (blogIndex > -1) {
      userBlogData.blogs[blogIndex] = { id, title, tags };
    } else {
      userBlogData.blogs.unshift({ id, title, tags });
    }

    const { error: listUploadError } = await supabase.storage
      .from("blogs")
      .upload(userBlogListFile, JSON.stringify(userBlogData, null, 2), {
        contentType: "application/json",
        upsert: true
      });
    if (listUploadError) throw listUploadError;

    return new Response(JSON.stringify({ success: true, blog: dbBlog }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});