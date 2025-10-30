import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("FRONTEND_URL"),
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
    const { markdown, user_id, blog_id } = await req.json();
    if (!markdown) {
      return new Response(JSON.stringify({
        error: "Markdown content required"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    const GROQ_API_KEY = Deno.env.get("GROQ_API");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!GROQ_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Environment variables not set");
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const prompt = `
Extract 5-10 relevant topic tags for the following Markdown content.
Return ONLY a valid JSON array of strings (like ["tag1","tag2",...]) and nothing else.

Markdown:
${markdown}
`;
    // --- Call Groq API ---
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a precise JSON generator."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "[]";
    const usage = data.usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0
    };
    // --- Cost estimation (Groq pricing example) ---
    const inputTokens = usage.prompt_tokens;
    const outputTokens = usage.completion_tokens;
    const inputCost = inputTokens / 1_000_000 * 0.05; // ~$0.05/million input
    const outputCost = outputTokens / 1_000_000 * 0.08; // ~$0.08/million output
    const totalCost = inputCost + outputCost;
    // --- Validate JSON ---
    let tags = [];
    try {
      tags = JSON.parse(text);
      if (!Array.isArray(tags)) throw new Error("Tags must be an array");
    } catch (e) {
      console.error("Invalid JSON output:", e);
      tags = [];
    }
    // --- Log generation stats ---
    const { error: logError } = await supabase.from("generation").insert({
      generation_type: "TAG",
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      input_cost: inputCost,
      output_cost: outputCost,
      total_cost: totalCost,
      user: user_id ?? null
    });
    if (logError) console.error("Logging error:", logError);
    return new Response(JSON.stringify({
      tags,
      usage: {
        inputTokens,
        outputTokens,
        inputCost,
        outputCost,
        totalCost
      }
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
