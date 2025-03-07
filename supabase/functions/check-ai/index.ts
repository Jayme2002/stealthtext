import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  text: string
}

// System prompt for AI detection
const AI_DETECTION_PROMPT = `Assume the role of an expert in linguistic forensics and AI content detection. I will provide you with a piece of text, and your task is to analyze it for indicators of AI generation. In your analysis, consider factors such as:

Perplexity and Burstiness: How predictable is the text? Does it exhibit natural variation in sentence length and structure, or is it unusually uniform? 
CAUSEWRITER.AI
Repetition and Formulaic Phrasing: Does the text repeat certain phrases or use overly generic language? 
REDDIT.COM
Grammatical Perfection: Is the text unnaturally flawless in its grammar and syntax?
Lack of Personal Touch or Emotion: Does the text miss the subtle markers of human experience, such as personal anecdotes, emotional nuance, or context-specific detail?
Stylistic Consistency: Does the writing feel homogenous or "averaged out" rather than reflecting a unique human voice?

After evaluating these aspects, provide:

A brief explanation highlighting the key features that support your analysis.
A single numerical score from 0 to 100, where 0 indicates the text is almost certainly human written and 100 indicates it is almost certainly AI generated.

For example, if you find that the text is highly repetitive, unusually consistent in structure, and lacks authentic human emotion, you might assign a high score (closer to 100). Conversely, if the text shows natural variability, personal insight, and minor imperfections, it would receive a lower score. if the number is anything below 15 then output 0, if its greater than 15 but less than 40 output a number between 10 and 20. and if its higher than 40 but less than 75 generate a number between 25 and 45. if its greater than 75% generate a number 90-100. ONLY OUT PUT A NUMBER IN YOUR RESPONSE NO EXPLANATION IS NEEDED AT ALL.

Text for Analysis:`;

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
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      console.error('OPENAI_API_KEY environment variable is not set')
      
      // Fallback to simple scoring if API key is missing
      const fallbackScore = calculateSimpleScore(text);
      return new Response(
        JSON.stringify({ 
          aiScore: fallbackScore,
          warning: 'Using fallback scoring. API key not configured.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Try to call the OpenAI API
    try {
      const requestPayload = {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: AI_DETECTION_PROMPT
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 5
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
        throw new Error(data.error?.message || 'OpenAI API error')
      }

      // Parse the response to extract the score
      const content = data.choices?.[0]?.message?.content || ''
      const scoreMatch = content.match(/\d+/)
      const aiScore = scoreMatch ? parseInt(scoreMatch[0], 10) : 0

      return new Response(
        JSON.stringify({ aiScore }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (apiError) {
      console.error('Error calling OpenAI API:', apiError)
      
      // Fallback to simple scoring if API call fails
      const fallbackScore = calculateSimpleScore(text);
      return new Response(
        JSON.stringify({ 
          aiScore: fallbackScore,
          warning: 'Using fallback scoring. API call failed.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
  } catch (error) {
    console.error('Error in check-ai function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', aiScore: 0 }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function for fallback scoring (when API is unavailable)
const calculateSimpleScore = (text: string): number => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 5) return 0; // Too short to analyze
  
  let score = 20; // Base score
  
  // Check for common AI patterns (very simplified)
  const aiIndicators = [
    /\b(ai generated|artificial intelligence|openai|chatgpt|gpt|language model)\b/gi,
    /\b(furthermore|moreover|thus|therefore)\b/gi,
    /\b(comprehensive|analyze|generate|output|response|prompt)\b/gi
  ];
  
  // Check for repetition
  const uniqueWordRatio = new Set(words.map(w => w.toLowerCase())).size / words.length;
  
  // Apply factors
  for (const pattern of aiIndicators) {
    score += (text.match(pattern) || []).length * 5;
  }
  
  // Lower unique word ratio suggests more repetition (more AI-like)
  score += (1 - uniqueWordRatio) * 20;
  
  // Cap score between 0-100
  return Math.min(Math.max(Math.round(score), 0), 100);
}; 