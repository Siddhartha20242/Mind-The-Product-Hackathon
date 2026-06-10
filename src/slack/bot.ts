import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { pendoTrack } from '../pendo/trackEvent';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Command handler for /secondme
app.command('/secondme', async ({ command, ack, respond }) => {
  await ack();

  const action = command.text.trim().toLowerCase();

  pendoTrack('slack_command_executed', command.user_id, 'system', {
    slackUserId: command.user_id,
    commandAction: action || 'help',
    channelId: command.channel_id
  })

  if (action === 'help' || action === '') {
    await respond({
      text: '*Second Me Commands:*\n' +
            '• `/secondme help` - Show this message\n' +
            '• `/secondme status` - Check bot status\n' +
            '• `/secondme ping` - Test response'
    });
  } else if (action === 'status') {
    await respond({ text: '🤖 Second Me is running!\n✅ Database connected\n✅ Bot online' });
  } else if (action === 'ping') {
    await respond({ text: '🏓 Pong!' });
  } else {
    await respond({ text: `Unknown command. Try /secondme help` });
  }
});

app.event('app_mention', async ({ event, say }) => {
  await say(`👋 Hello <@${event.user}>! I am Second Me. Type \`/secondme help\``);
});

async function start() {
  await app.start();
  console.log('🤖 Slack bot running!');
}

export { app, start };