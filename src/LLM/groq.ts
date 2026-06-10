// Step 123: Import Groq from 'groq-sdk'
import Groq from 'groq-sdk';

// Step 124: Create groq client with API key from .env
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,  // Reads GROQ_API_KEY from .env file
});

// Step 125: Set default model (Llama 4 Scout)
const DEFAULT_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Step 126: Set temperature to 0.3 for consistent output
// Lower temperature = more focused, deterministic responses
// Higher temperature = more creative, random responses
const DEFAULT_TEMPERATURE = 0.3;

// Step 127: Set max_tokens to 1000 (max length of response)
const DEFAULT_MAX_TOKENS = 1000;

/**
 * Step 128: Create callGroq function to handle API calls
 * 
 * @param messages - Either a string prompt OR array of message objects
 * @param model - Which AI model to use (default: Llama 4 Scout)
 * @param temperature - Controls randomness (0 = consistent, 1 = creative)
 * @param maxTokens - Maximum length of response
 * @returns The AI's response text
 */
export async function callGroq(
  messages: string | Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string = DEFAULT_MODEL,
  temperature: number = DEFAULT_TEMPERATURE,
  maxTokens: number = DEFAULT_MAX_TOKENS
): Promise<string> {
  
  // Convert string prompt to proper message format
  // If user just sends "Hello", convert to [{ role: "user", content: "Hello" }]
  const formattedMessages = typeof messages === 'string'
    ? [{ role: 'user' as const, content: messages }]
    : messages;

  let lastError: Error | null = null;
  
  // Step 129: Add error handling with retry logic (max 3 retries)
  // This tries the API call up to 3 times before giving up
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🔄 Groq API call attempt ${attempt}...`);
      
      // Make the actual API call to Groq
      const response = await groq.chat.completions.create({
        messages: formattedMessages,  // The prompt/question
        model: model,                 // Which AI to use
        temperature: temperature,     // How creative to be
        max_tokens: maxTokens,        // Max response length
      });

      // Extract the text response from the API response
      const content = response.choices[0]?.message?.content || '';
      console.log(`✅ Groq API call successful!`);
      return content;  // Step 128: Return the response content
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Groq API attempt ${attempt} failed:`, error.message);
      
      // If not the last attempt, wait before retrying
      if (attempt < 3) {
        const waitTime = attempt * 1000;  // 1 second, then 2 seconds
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // If all 3 attempts fail, throw an error
  throw new Error(`Groq API failed after 3 attempts: ${lastError?.message}`);
}

/**
 * Step 130: Test function with simple prompt: "Hello, are you working?"
 * This helps verify Groq is set up correctly
 */
export async function testGroq(): Promise<boolean> {
  try {
    console.log('🧪 Testing Groq connection...');
    console.log('📤 Sending prompt: "Hello, are you working?"');
    
    // Call the AI with a simple test prompt
    const response = await callGroq('Hello, are you working?');
    
    console.log('📝 Groq response:', response);
    console.log('✅ Groq is working!');
    return true;
  } catch (error) {
    console.error('❌ Groq test failed:', error);
    return false;
  }
}

export default groq;