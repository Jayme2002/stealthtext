import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { CreateChatCompletionRequest } from 'https://esm.sh/openai@4.0.0/resources/chat/completions'

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

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      console.error('OPENAI_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ error: 'API configuration error', aiScore: 0 }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare the request to OpenAI API
    const requestPayload: CreateChatCompletionRequest = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI detection expert. You will be provided with text and your task is to determine if it was written by an AI. You should respond with a number between 0-100 indicating the probability that the text was AI-generated, where 0 means definitely human-written and 100 means definitely AI-generated."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 10
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestPayload)
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('OpenAI API error:', data.error)
      return new Response(
        JSON.stringify({ error: 'AI detection API error', aiScore: 0 }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the response to extract the score
    const content = data.choices?.[0]?.message?.content || ''
    const scoreMatch = content.match(/\d+/)
    const aiScore = scoreMatch ? parseInt(scoreMatch[0], 10) : 0

    return new Response(
      JSON.stringify({ aiScore }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in check-ai function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', aiScore: 0 }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 