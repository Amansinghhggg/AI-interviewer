import dotenv from "dotenv";
dotenv.config();

// We override some config manually if we want to ensure it tries Gemini
process.env.AI_PROVIDER = 'gemini';
process.env.GEMINI_MODEL = 'gemini-2.5-flash';

import { createAIProvider } from "./src/modules/interview/providers/AIProvider/index.js";

async function runSmokeTest() {
  console.log("=== AI Provider Smoke Test ===");
  try {
    const provider = createAIProvider();
    console.log("✅ Factory instantiated provider successfully:", provider.constructor.name);
    
    console.log("Sending test prompt: 'Hello, respond with the exact word: SUCCESS'");
    
    // Note: If no GEMINI_API_KEY is present in .env, this will throw our custom missing key error
    // before it even tries to send the prompt.
    const result = await provider.generate("Hello, respond with the exact word: SUCCESS");
    
    console.log("\n--- RAW RESPONSE ---");
    console.log(result);
    console.log("--------------------\n");
    console.log("✅ Smoke test passed!");
    
  } catch (error) {
    console.log("\n❌ Smoke test caught an expected application-level error:");
    console.log(error.message);
    console.log("\n(This is normal if GEMINI_API_KEY is not set in your .env file or is invalid)");
  }
}

runSmokeTest();
