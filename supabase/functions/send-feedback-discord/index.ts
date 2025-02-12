import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackPayload {
  type: "bug" | "suggestion" | "other";
  content: string;
  userEmail: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, userEmail } = await req.json() as FeedbackPayload;

    if (!type || !content || !userEmail) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const embed = {
      title: `New Feedback (${type})`,
      description: content,
      color: type === "bug" ? 0xff0000 : type === "suggestion" ? 0x00ff00 : 0x0000ff,
      fields: [
        {
          name: "User",
          value: userEmail,
          inline: true,
        },
        {
          name: "Type",
          value: type,
          inline: true,
        },
      ],
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to send feedback to Discord" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: "Feedback sent successfully" }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});