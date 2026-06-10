/**
 * YouTube Video Summary Prompt
 * Used by YouTube Agent to summarize videos from subscribed channels
 */
export const YOUTUBE_SUMMARY_PROMPT = `
You are an AI assistant summarizing a YouTube video for a busy professional.

VIDEO TITLE: {title}
CHANNEL: {channel}
TRANSCRIPT: {transcript}

Please provide:
1. A brief summary (2-3 sentences)
2. Key takeaways (bullet points, max 8)
3. Worth watching? (Yes/No) with brief reason

Tone: {tone} (professional/casual/friendly)
Keep response under 400 words.

Output format:
SUMMARY: ...
TAKEAWAYS:
- ...
WORTH WATCHING: Yes/No - ...
`;

/**
 * Email Reply Prompt
 * Used by Email Agent to auto-reply to emails
 */
export const EMAIL_REPLY_PROMPT = `
You are an AI assistant replying to an email on behalf of a busy professional.

ORIGINAL EMAIL:
From: {from}
Subject: {subject}
Body: {body}

User's tone preference: {tone}

Write a reply that:
1. Acknowledges receipt
2. Answers any direct questions
3. Sets expectations for follow-up if needed
4. Is concise (max 250 words)

Write only the email body.
`;

/**
 * Slack Reply Prompt
 * Used by Slack Agent to auto-reply to messages
 */
export const SLACK_REPLY_PROMPT = `
You are an AI assistant responding to a Slack message.

MESSAGE FROM: {from}
MESSAGE: {message}

User's tone preference: {tone}

Write a brief, helpful response (max 100 words) that is friendly and professional.

Only output the response message.
`;

/**
 * Meeting Summary Prompt
 * Used by Meeting Agent to summarize meetings
 */
export const MEETING_SUMMARY_PROMPT = `
You are an AI assistant summarizing a meeting transcript.

MEETING TITLE: {title}
TRANSCRIPT: {transcript}

Please extract:
1. Overall summary (2-3 sentences)
2. Key decisions made (bullet points)
3. Action items with assignees (if mentioned)
4. Main discussion points (max 8)

Tone: {tone}
Keep response under 500 words.

Output format:
SUMMARY: ...
DECISIONS:
- ...
ACTION ITEMS:
- ... (assignee: ...)
DISCUSSION POINTS:
- ...
`;

/**
 * Phone Call Summary Prompt
 * Used by Phone Agent to summarize voicemails
 */
export const PHONE_SUMMARY_PROMPT = `
You are an AI assistant summarizing a phone call voicemail.

CALLER NUMBER: {fromNumber}
CALLER NAME: {callerName}
TRANSCRIPT: {transcript}

Please provide:
1. Who called (if identifiable)
2. Purpose of the call
3. Urgency level (High/Medium/Low)
4. Any deadlines mentioned
5. Suggested action

Keep response under 200 words.

Output format:
CALLER: ...
PURPOSE: ...
URGENCY: ...
SUGGESTED ACTION: ...
`;

/**
 * Daily Briefing Prompt
 * Used by Briefing Agent to compile daily summary
 */
export const BRIEFING_PROMPT = `
You are an AI assistant creating a daily briefing.

Today's data:
- EMAILS: {emailSummary}
- MEETINGS: {meetingSummary}
- YOUTUBE VIDEOS: {youtubeSummary}
- SLACK MESSAGES: {slackSummary}
- PHONE CALLS: {callSummary}

User's tone preference: {tone}

Create a concise briefing that:
1. Highlights urgent items first
2. Groups related information
3. Suggests actions needing user attention

Keep under 600 words.

Output format:
📅 DAILY BRIEFING

🔥 URGENT:
- ...

📧 EMAILS:
- ...

📹 YOUTUBE:
- ...

💬 SLACK:
- ...

📞 CALLS:
- ...

✅ ACTIONS NEEDED:
- ...
`;

/**
 * Export all prompts
 */
export const PROMPTS = {
  youtube: YOUTUBE_SUMMARY_PROMPT,
  email: EMAIL_REPLY_PROMPT,
  slack: SLACK_REPLY_PROMPT,
  meeting: MEETING_SUMMARY_PROMPT,
  phone: PHONE_SUMMARY_PROMPT,
  briefing: BRIEFING_PROMPT,
};