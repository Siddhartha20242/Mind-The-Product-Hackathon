// TODO: When implementing the Slack agent, add the following Pendo track event
// after successfully auto-replying to a Slack message:
//
// import { pendoTrack } from '../pendo/trackEvent'
//
// pendoTrack('slack_auto_replied', userId, 'system', {
//   slackRepliedCount: <cumulative count>,
//   toneStyle: <tone used>,
//   autoReplySlack: true,
//   hoursSaved: <estimated hours saved>
// })
