import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

export type HumanizerIntensity = 'LOW' | 'MEDIUM' | 'HIGH'

interface RequestBody {
  text: string
  intensity?: HumanizerIntensity
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, intensity = 'HIGH' } = await req.json() as RequestBody
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('HUMANIZED_AI_API_KEY')
    if (!apiKey) {
      console.error('HUMANIZED_AI_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ error: 'API configuration error', humanizedText: text }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = 'https://api.humanizer.ai/v1/humanize'
    const payload = {
      text,
      humanizerIntensity: intensity,
      purpose: "GENERAL",
      literacyLevel: "COLLEGE"
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify(payload)
    })

    const json = await response.json()
    if (!response.ok) {
      console.error('Humanization API error:', json.error)
      return new Response(
        JSON.stringify({ error: 'Humanization API error', humanizedText: text }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ humanizedText: json.humanizedText || text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in humanize-text function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 