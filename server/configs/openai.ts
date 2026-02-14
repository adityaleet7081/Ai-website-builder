import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.AI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ai-website-builder-ui.onrender.com", // Your frontend URL
    "X-Title": "AI Website Builder", // Your app name
  },
});

export default openai;