import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  text: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json() as RequestBody
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get API key from environment variables
    const apiKey = Deno.env.get('HUMANIZED_AI_API_KEY')
    if (!apiKey) {
      console.error('HUMANIZED_AI_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = 'https://www.the-ghost-ai-api.com/detection/ai-v2/'
    const payload = { text }

    // Make the API request with the correct authentication format
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Api-Key ${apiKey}`
        },
        body: JSON.stringify(payload)
      })
      
      const json = await response.json()
      if (!response.ok) {
        console.error('AI detection API error:', json.error)
        throw new Error(json.error || 'AI detection API error')
      }
      
      return new Response(
        JSON.stringify({ result: json }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (apiError) {
      console.error('Error calling AI detection API:', apiError)
      return new Response(
        JSON.stringify({ 
          error: apiError instanceof Error ? apiError.message : 'Failed to call AI detection API'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in detect-ai function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})