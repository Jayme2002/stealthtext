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

    // Extract the actual key if it already includes "Api-Key "
    let apiKey = Deno.env.get('HUMANIZED_AI_API_KEY') || '';
    if (apiKey.startsWith('Api-Key ')) {
      apiKey = apiKey.substring(8); // Remove the "Api-Key " prefix
    }

    // Now construct the header correctly
    const authHeader = `Api-Key ${apiKey}`;

    const url = 'https://www.the-ghost-ai-api.com/detection/ai-v2/'
    const payload = { text }

    // Explicitly log the exact auth header format
    console.log(`EXACT AUTH HEADER FORMAT: "Authorization": "Api-Key ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}"`);

    // Make the API request with the correct authentication format
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
        body: JSON.stringify(payload)
      })
      
      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
      let json;
      try {
        json = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response as JSON:', e)
        throw new Error('Invalid JSON response')
      }
      
      if (!response.ok) {
        console.error('AI detection API error:', json)
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