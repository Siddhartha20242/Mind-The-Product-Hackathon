import Groq from "groq-sdk";
import { pendoTrack } from "../utils/pendo";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function queryAi(
  model: string,
  messages: Array<{ role: string; content: string }>,
  queryType: string,
  isStreaming: boolean,
  visitorId: string,
  accountId: string
) {
  const startTime = Date.now();

  const completion = await groq.chat.completions.create({
    model,
    messages: messages as any,
    stream: false,
  });

  const responseTime = Date.now() - startTime;

  // Track successful AI query completion
  await pendoTrack("ai_query_completed", visitorId, accountId, {
    model,
    promptTokens: completion.usage?.prompt_tokens || 0,
    completionTokens: completion.usage?.completion_tokens || 0,
    responseTime,
    queryType,
    isStreaming,
  });

  return completion;
}

export async function delegateTask(
  taskType: string,
  taskInput: any,
  delegationSource: string,
  aiModel: string,
  visitorId: string,
  accountId: string
) {
  const startTime = Date.now();

  const messages = [
    { role: "system" as const, content: `You are a task assistant. Process this ${taskType} task.` },
    { role: "user" as const, content: JSON.stringify(taskInput) },
  ];

  const completion = await groq.chat.completions.create({
    model: aiModel,
    messages,
  });

  const processingTime = Date.now() - startTime;
  const outcome = completion.choices?.[0]?.finish_reason === "stop" ? "success" : "incomplete";

  // Track successful task delegation
  await pendoTrack("ai_task_delegated", visitorId, accountId, {
    taskType,
    delegationSource,
    aiModel,
    processingTime,
    outcome,
  });

  return { result: completion.choices?.[0]?.message?.content, outcome };
}
