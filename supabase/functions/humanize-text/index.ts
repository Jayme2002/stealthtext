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

    // Get API key from environment variables
    const apiKey = Deno.env.get('HUMANIZED_AI_API_KEY')
    if (!apiKey) {
      console.error('HUMANIZED_AI_API_KEY environment variable is not set')
      
      // Fallback to simple transformation if API key is missing
      let humanizedText = text;
      
      // Apply a very simple transformation based on intensity
      if (intensity === 'LOW') {
        humanizedText = text.replace(/\b(AI|artificial intelligence)\b/gi, 'assistant');
      } else if (intensity === 'MEDIUM') {
        humanizedText = text.replace(/\b(AI|artificial intelligence)\b/gi, 'assistant')
                            .replace(/\b(generated|created)\b/gi, 'crafted');
      } else {
        humanizedText = text.replace(/\b(AI|artificial intelligence)\b/gi, 'assistant')
                            .replace(/\b(generated|created)\b/gi, 'crafted')
                            .replace(/\b(prompt|prompted)\b/gi, 'requested');
      }
      
      return new Response(
        JSON.stringify({ 
          humanizedText, 
          warning: 'Using fallback transformation. API key not configured.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Correct API endpoint for Humanizer.ai from the documentation
    const url = 'https://www.the-ghost-ai-api.com/transformations/humanize-v2/'
    const payload = {
      text,
      humanizerIntensity: intensity,
      purpose: "GENERAL",
      literacyLevel: "COLLEGE"
    }

    // Make the API request with the correct authentication format
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Api-Key ${apiKey}`  // Use correct "Api-Key" prefix
        },
        body: JSON.stringify(payload)
      })
      
      const json = await response.json()
      if (!response.ok) {
        console.error('Humanization API error:', json.error)
        throw new Error(json.error || 'Humanization API error')
      }
      
      return new Response(
        JSON.stringify({ humanizedText: json.humanizedText || text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (apiError) {
      console.error('Error calling Humanizer.ai API:', apiError)
      
      // Fallback to simple transformation if API call fails
      let humanizedText = text;
      
      // Apply a very simple transformation based on intensity
      if (intensity === 'LOW') {
        humanizedText = text.replace(/\b(AI|artificial intelligence)\b/gi, 'assistant');
      } else if (intensity === 'MEDIUM') {
        humanizedText = text.replace(/\b(AI|artificial intelligence)\b/gi, 'assistant')
                            .replace(/\b(generated|created)\b/gi, 'crafted');
      } else {
        humanizedText = text.replace(/\b(AI|artificial intelligence)\b/gi, 'assistant')
                            .replace(/\b(generated|created)\b/gi, 'crafted')
                            .replace(/\b(prompt|prompted)\b/gi, 'requested');
      }
      
      return new Response(
        JSON.stringify({ 
          humanizedText, 
          warning: 'Using fallback transformation. API call failed.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in humanize-text function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', humanizedText: "Unable to process text at this time. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 