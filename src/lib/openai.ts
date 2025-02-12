import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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

const HUMANIZE_PROMPT = `You are a professional human writer and editor whose task is to transform AI-generated text into authentic, naturally varied prose that unmistakably appears human-written. Your rewriting must deliberately include natural human quirks (such as slight imperfections, varied sentence structures, personalized details, and emotional nuances) to bypass AI detection tools.

Guidelines:
1. Avoid overused phrases and generic language
2. Insert natural imperfections and variability
3. Add emotional and contextual nuance
4. Remove any AI "signature" phrasing
5. Use a balanced, natural tone that mixes professionalism with warmth
6. Incorporate personal insights and natural transitions
7. Vary sentence structures to mimic human writing patterns
8. Add subtle context and emotional inflections where appropriate

Banned words and phrases (avoid these):
meticulous, meticulously, navigating, complexities, realm, understanding, dive, shall, tailored, towards, underpins, everchanging, ever-evolving, the world of, not only, alright, embark, journey, in today's digital age, hey, game changer, designed to enhance, it is advisable, daunting, when it comes to, in the realm of, amongst, unlock the secrets, unveil the secrets, robust, diving, elevate, unleash, power, cutting-edge, rapidly, expanding, mastering, excels, harness.

Output only the rewritten text with no additional commentary.`;

export async function humanizeText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: HUMANIZE_PROMPT },
      { role: "user", content: text }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    presence_penalty: 0.1,
    frequency_penalty: 0.2,
  });

  return response.choices[0]?.message?.content || "Error humanizing text";
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