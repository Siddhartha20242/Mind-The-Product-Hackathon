import { Queue, Worker, Job } from "bullmq";
import cron from "node-cron";
import { pendoTrack } from "../utils/pendo";

const connection = { host: process.env.REDIS_HOST || "localhost", port: 6379 };
const taskQueue = new Queue("tasks", { connection });

export async function scheduleTask(
  taskType: string,
  data: any,
  cronExpression: string | undefined,
  priority: number,
  visitorId: string,
  accountId: string
) {
  const isRecurring = !!cronExpression;
  let jobId: string | undefined;

  if (cronExpression) {
    cron.schedule(cronExpression, async () => {
      await taskQueue.add(taskType, data, { priority });
    });
  } else {
    const job = await taskQueue.add(taskType, data, { priority });
    jobId = job.id;
  }

  // Track successful task scheduling
  await pendoTrack("task_scheduled", visitorId, accountId, {
    taskType,
    scheduledTime: new Date().toISOString(),
    cronExpression: cronExpression || "",
    isRecurring,
    queueName: "tasks",
    priority,
  });

  return { jobId, isRecurring };
}

export async function scheduleBulkTasks(
  taskType: string,
  items: any[],
  priority: number,
  batchId: string,
  visitorId: string,
  accountId: string
) {
  const jobs = items.map((item) => ({
    name: taskType,
    data: item,
    opts: { priority },
  }));

  await taskQueue.addBulk(jobs);

  // Track successful bulk task queuing
  await pendoTrack("bulk_task_queued", visitorId, accountId, {
    taskCount: items.length,
    taskType,
    queueName: "tasks",
    priority,
    batchId,
  });

  return { queued: items.length, batchId };
}

// Worker to process tasks and track completion/failure
const worker = new Worker(
  "tasks",
  async (job: Job) => {
    // Process job (application logic here)
    return { processed: true };
  },
  { connection }
);

worker.on("completed", async (job: Job, result: any) => {
  const visitorId = job.data?.visitorId || "system";
  const accountId = job.data?.accountId || "system";

  // Track task completion
  await pendoTrack("task_completed", visitorId, accountId, {
    taskType: job.name,
    executionDuration: job.finishedOn && job.processedOn
      ? job.finishedOn - job.processedOn
      : 0,
    outcome: "success",
    queueName: "tasks",
    retryCount: job.attemptsMade,
    jobId: job.id || "",
  });
});

worker.on("failed", async (job: Job | undefined, error: Error) => {
  if (!job) return;

  const visitorId = job.data?.visitorId || "system";
  const accountId = job.data?.accountId || "system";

  // Track task failure
  await pendoTrack("task_failed", visitorId, accountId, {
    taskType: job.name,
    errorType: error.name || "Error",
    errorMessage: error.message?.substring(0, 200) || "",
    queueName: "tasks",
    retryCount: job.attemptsMade,
    jobId: job.id || "",
  });
});

export { taskQueue, worker };
