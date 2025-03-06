import OpenAI from 'openai';

// Use the non-VITE prefixed environment variable with fallback
const openaiApiKey = typeof window !== 'undefined' 
  ? import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY 
  : process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

// Create a dummy client for development or if key is missing
const openai = openaiApiKey 
  ? new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    })
  : {
      chat: { 
        completions: { 
          create: async () => ({ 
            choices: [{ message: { content: "0" } }] 
          }) 
        } 
      }
    };

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

export type HumanizerIntensity = 'LOW' | 'MEDIUM' | 'HIGH';

export async function humanizeText(text: string, intensity: HumanizerIntensity = 'HIGH'): Promise<string> {
  const url = "https://www.the-ghost-ai-api.com/transformations/humanize-v2/";
  
  // Use the non-VITE prefixed environment variable with fallback
  const apiKey = typeof window !== 'undefined'
    ? import.meta.env.HUMANIZED_AI_API_KEY || import.meta.env.VITE_HUMANIZED_AI_API_KEY
    : process.env.HUMANIZED_AI_API_KEY || process.env.VITE_HUMANIZED_AI_API_KEY;
  
  if (!apiKey) {
    console.warn('Humanized AI API key is missing, returning original text');
    return text;
  }
  
  const payload = {
    text,
    humanizerIntensity: intensity,
    purpose: "GENERAL",
    literacyLevel: "COLLEGE"
  };
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey
      },
      body: JSON.stringify(payload)
    });
    
    const json = await response.json();
    if (!response.ok) {
      console.error('Humanization API error:', json.error);
      return text; // Return original text on error
    }
    
    return json.humanizedText || text;
  } catch (error) {
    console.error('Error calling humanization API:', error);
    return text; // Return original text on error
  }
}

export async function checkForAI(text: string): Promise<number> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: AI_DETECTION_PROMPT },
      { role: "user", content: text }
    ],
    temperature: 0.1,
    max_tokens: 5,
    presence_penalty: 0,
    frequency_penalty: 0,
  });

  const result = response.choices[0]?.message?.content || "0";
  return parseInt(result) || 0;
}