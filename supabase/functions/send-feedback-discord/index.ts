import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeedbackPayload {
  type: 'bug' | 'suggestion' | 'other'
  content: string
  userEmail: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, content, userEmail } = await req.json() as FeedbackPayload

    // Create Discord message embed
    const embed = {
      title: `New Feedback (${type})`,
      description: content,
      color: type === 'bug' ? 0xFF0000 : type === 'suggestion' ? 0x00FF00 : 0x0000FF,
      fields: [
        {
          name: 'User',
          value: userEmail,
          inline: true
        },
        {
          name: 'Type',
          value: type,
          inline: true
        },
        {
          name: 'Timestamp',
          value: new Date().toISOString(),
          inline: true
        }
      ]
    }

    // Send to Discord
    const discordResponse = await fetch(DISCORD_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    })

    if (!discordResponse.ok) {
      throw new Error(`Discord webhook failed: ${discordResponse.statusText}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error sending feedback to Discord:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})