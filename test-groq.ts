import dotenv from 'dotenv';
dotenv.config();

import { testGroq } from './src/llm/groq';

console.log('GROQ_API_KEY loaded:', !!process.env.GROQ_API_KEY);
console.log('First 10 chars:', process.env.GROQ_API_KEY?.substring(0, 10));

testGroq();
