import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("FRONTEND_URL") ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// Schema validation for sanity
const TitleSchema = z.string().min(3).max(150);
const ContentSchema = z.string().min(100);
const TagsSchema = z.array(z.string().min(1)).min(2).max(10);
async function callGroq(prompt, model, apiKey) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API Error: ${text}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq returned no content");
  return {
    text,
    usage: data?.usage ?? {}
  };
}
serve(async (req)=>{
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    const { summary, user_id, mood } = await req.json();
    if (!summary || !mood) {
      return new Response(JSON.stringify({
        error: "summary and mood are required"
      }), {
        status: 400,
        headers: corsHeaders
      });
    } else if (!user_id) {
      return new Response(JSON.stringify({
        error: "user_id is required"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    const GROQ_API_KEY = Deno.env.get("GROQ_API");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!GROQ_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const model = "llama-3.1-8b-instant";
    // --- Step 1: Title ---
    const titlePrompt = `
Write a short, catchy blog title for the following idea.
Mood: ${mood}.
Summary:
${summary}

Keep it under 10 words.
Return only the title text.
`;
    const titleRes = await callGroq(titlePrompt, model, GROQ_API_KEY);
    const title = TitleSchema.parse(titleRes.text.replace(/["']/g, "").trim());
    // --- Step 2: Content ---
    const contentPrompt = `
Write a long, well-structured blog post titled "${title}".
Use markdown formatting (headings, lists, quotes, etc.).
Keep the tone ${mood.toLowerCase()}.
Summary:
${summary}
`;
    const contentRes = await callGroq(contentPrompt, model, GROQ_API_KEY);
    const content = ContentSchema.parse(contentRes.text.trim());
    // --- Step 3: Tags ---
    const tagsPrompt = `
List 5 short, relevant tags (1–3 words each) for a blog titled "${title}".
Separate them with commas.
`;
    const tagsRes = await callGroq(tagsPrompt, model, GROQ_API_KEY);
    const tags = TagsSchema.parse(tagsRes.text.split(",").map((t)=>t.trim().replace(/^#/, "")).filter((t)=>t.length > 0));
    // --- Log usage ---
    const totalUsage = {
      input_tokens: (titleRes.usage.prompt_tokens ?? 0) + (contentRes.usage.prompt_tokens ?? 0) + (tagsRes.usage.prompt_tokens ?? 0),
      output_tokens: (titleRes.usage.completion_tokens ?? 0) + (contentRes.usage.completion_tokens ?? 0) + (tagsRes.usage.completion_tokens ?? 0)
    };
    const inputCost = totalUsage.input_tokens / 1_000_000 * 0.05; // ~$0.05/million input
    const outputCost = totalUsage.output_tokens / 1_000_000 * 0.08; // ~$0.08/million output
    const totalCost = inputCost + outputCost;
    const { data: generationData, error: logError } = await supabase.from("generation").insert({
      generation_type: "BLOG",
      input_tokens: totalUsage.input_tokens,
      output_tokens: totalUsage.output_tokens,
      input_cost: inputCost,
      output_cost: outputCost,
      total_cost: totalCost,
      user: user_id,
      blog: blog_id
    }).select('id').single();
    if (logError) console.error("Failed to log generation:", logError);
    const generationId = generationData?.id;

    // --- Respond ---
    return new Response(JSON.stringify({
      title,
      content,
      tags,
      generationId
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    const msg = err instanceof z.ZodError ? `Invalid response: ${err.errors.map((e)=>e.message).join(", ")}` : err.message;
    return new Response(JSON.stringify({
      error: msg
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
