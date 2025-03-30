import OpenAI from "openai";

// Define default models
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-ada-002';
export const DEFAULT_LLM_MODEL = 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get embeddings for text
export async function getEmbedding(text: string, model = DEFAULT_EMBEDDING_MODEL): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model,
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding from OpenAI:', error);
    throw error;
  }
}

// Generate chat completion
export async function generateCompletion(
  messages: any[],
  model = DEFAULT_LLM_MODEL
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating completion from OpenAI:', error);
    throw error;
  }
}

// Export default module for import in routes
export default {
  getEmbedding,
  generateCompletion,
};