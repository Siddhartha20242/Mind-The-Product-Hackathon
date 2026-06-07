import { App } from "@slack/bolt";
import { pendoTrack } from "../utils/pendo";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Handle incoming messages
app.message(async ({ message, context }) => {
  const startTime = Date.now();

  try {
    const msg = message as any;
    const visitorId = msg.user || "system";
    const accountId = context.teamId || "system";

    // Process the message (application logic here)

    // Track successful message handling
    await pendoTrack("slack_message_sent", visitorId, accountId, {
      channelId: msg.channel || "",
      channelType: msg.channel_type || "",
      messageType: msg.subtype || "standard",
      hasAttachments: !!(msg.files && msg.files.length > 0),
      isThreadReply: !!msg.thread_ts,
    });
  } catch (error) {
    console.error("Error handling Slack message:", error);
  }
});

// Handle slash commands
app.command(/.*/, async ({ command, ack, context }) => {
  const startTime = Date.now();

  try {
    await ack();

    const visitorId = command.user_id || "system";
    const accountId = command.team_id || context.teamId || "system";

    // Process the command (application logic here)

    const responseTime = Date.now() - startTime;

    // Track successful command execution
    await pendoTrack("slack_command_executed", visitorId, accountId, {
      commandName: command.command,
      channelId: command.channel_id,
      executionStatus: "success",
      responseTime,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const cmd = command as any;
    await pendoTrack(
      "slack_command_executed",
      cmd.user_id || "system",
      cmd.team_id || "system",
      {
        commandName: cmd.command || "",
        channelId: cmd.channel_id || "",
        executionStatus: "error",
        responseTime,
      }
    );
    console.error("Error handling Slack command:", error);
  }
});

export { app as slackApp };
