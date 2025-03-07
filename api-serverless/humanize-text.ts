import { VercelRequest, VercelResponse } from '@vercel/node';
import { HumanizerIntensity } from '../src/lib/openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, intensity = 'HIGH' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Access API key from server environment variables
    const apiKey = process.env.HUMANIZED_AI_API_KEY;

    if (!apiKey) {
      console.warn('Humanized AI API key is missing');
      return res.status(500).json({ 
        error: 'API configuration error',
        humanizedText: text // Return original text on error
      });
    }

    const url = "https://www.the-ghost-ai-api.com/transformations/humanize-v2/";
    
    const payload = {
      text,
      humanizerIntensity: intensity,
      purpose: "GENERAL",
      literacyLevel: "COLLEGE"
    };

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
      return res.status(response.status).json({ 
        error: json.error || 'Humanization failed',
        humanizedText: text // Return original text on error
      });
    }
    
    return res.status(200).json({ humanizedText: json.humanizedText || text });
  } catch (error) {
    console.error('Error in humanize-text API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      humanizedText: req.body.text // Return original text on error
    });
  }
} 