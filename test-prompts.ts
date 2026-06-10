import {
  YOUTUBE_SUMMARY_PROMPT,
  EMAIL_REPLY_PROMPT,
  SLACK_REPLY_PROMPT,
  MEETING_SUMMARY_PROMPT,
  PHONE_SUMMARY_PROMPT,
  BRIEFING_PROMPT,
  PROMPTS,
} from './src/llm/prompts';

console.log('✅ All prompts loaded!\n');
console.log('📹 YouTube prompt preview:', YOUTUBE_SUMMARY_PROMPT.slice(0, 100), '...\n');
console.log('📧 Email prompt length:', EMAIL_REPLY_PROMPT.length);
console.log('💬 Slack prompt length:', SLACK_REPLY_PROMPT.length);
console.log('📅 Meeting prompt length:', MEETING_SUMMARY_PROMPT.length);
console.log('📞 Phone prompt length:', PHONE_SUMMARY_PROMPT.length);
console.log('📰 Briefing prompt length:', BRIEFING_PROMPT.length);
console.log('\n📦 Exported prompt keys:', Object.keys(PROMPTS));
