import Groq from "groq-sdk";

// Lazy load Groq client to prevent crash if API key is missing during build/initialization
const getGroqClient = () => {
  const apiKey = process.env.API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("GROQ_API_KEY is not set. AI features will not work.");
    return null;
  }
  return new Groq({ apiKey, dangerouslyAllowBrowser: true });
};

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export const AVAILABLE_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Versatile)" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Instant)" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", name: "Gemma 2 9B" },
];

export const generateEmailDraft = async (
  prompt: string,
  isWebFormat: boolean,
  modelId: string = "llama-3.3-70b-versatile"
): Promise<GeneratedEmail> => {
  
  const systemInstruction = `You are an expert professional email writer assistant. 
  Your task is to take a raw user input (which acts as a prompt) and convert it into a polished, professional email.
  
  If 'isWebFormat' is true, structure the email body using HTML with inline CSS for a modern, newsletter-style appearance (use divs, padding, background colors, readable fonts).
  If 'isWebFormat' is false, generate PLAIN TEXT with no HTML tags. Use newlines for spacing between paragraphs.
  
  You must also generate a concise and professional Subject line based on the content.
  The output must be a valid JSON object with the keys "subject" and "body".
  JSON format only.`;

  const groq = getGroqClient();
  if (!groq) {
      throw new Error("La clé API Groq n'est pas configurée. Veuillez ajouter GROQ_API_KEY dans vos variables d'environnement.");
  }

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemInstruction + `\n\nConfiguration: isWebFormat=${isWebFormat}`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: modelId,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as GeneratedEmail;
};
