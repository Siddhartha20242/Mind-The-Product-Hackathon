import prisma from './client.js'
import { pendoTrack } from '../pendo/trackEvent'

export async function getUserBySlackId(slackId: string) {
  return prisma.user.findUnique({
    where: { slackId }
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  })
}

export async function createUser(data: {
  slackId: string
  email: string
  slackToken?: string
}) {
  const user = await prisma.user.create({
    data: {
      slackId: data.slackId,
      email: data.email,
      slackToken: data.slackToken
    }
  })

  pendoTrack('user_created', user.id, 'system', {
    slackId: data.slackId,
    email: data.email,
    hasSlackToken: !!data.slackToken
  })

  return user
}

export async function getAllUsers() {
  return prisma.user.findMany()
}

export async function updateUserTokens(
  userId: string,
  tokens: {
    slackToken?: string
    gmailToken?: string
    calendarToken?: string
    youtubeToken?: string
    githubToken?: string
    twilioToken?: string
  }
) {
  const result = await prisma.user.update({
    where: { id: userId },
    data: tokens
  })

  const tokensUpdated = Object.keys(tokens).filter(k => tokens[k as keyof typeof tokens] !== undefined)
  pendoTrack('user_tokens_updated', userId, 'system', {
    tokensUpdated: tokensUpdated.join(','),
    connectedServicesCount: tokensUpdated.length,
    hasGmailToken: tokens.gmailToken !== undefined,
    hasCalendarToken: tokens.calendarToken !== undefined,
    hasYoutubeToken: tokens.youtubeToken !== undefined,
    hasGithubToken: tokens.githubToken !== undefined,
    hasTwilioToken: tokens.twilioToken !== undefined
  })

  return result
}

export async function incrementUserStats(
  userId: string,
  stats: {
    meetingsAttended?: number
    emailsReplied?: number
    slackReplied?: number
    youtubeSummarized?: number
    callsAnswered?: number
    hoursSaved?: number
  }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      meetingsAttended: (user.meetingsAttended || 0) + (stats.meetingsAttended || 0),
      emailsReplied: (user.emailsReplied || 0) + (stats.emailsReplied || 0),
      slackReplied: (user.slackReplied || 0) + (stats.slackReplied || 0),
      youtubeSummarized: (user.youtubeSummarized || 0) + (stats.youtubeSummarized || 0),
      callsAnswered: (user.callsAnswered || 0) + (stats.callsAnswered || 0),
      hoursSaved: (user.hoursSaved || 0) + (stats.hoursSaved || 0)
    }
  })

  pendoTrack('user_stats_incremented', userId, 'system', {
    meetingsAttended: stats.meetingsAttended || 0,
    emailsReplied: stats.emailsReplied || 0,
    slackReplied: stats.slackReplied || 0,
    youtubeSummarized: stats.youtubeSummarized || 0,
    callsAnswered: stats.callsAnswered || 0,
    hoursSaved: stats.hoursSaved || 0
  })

  return result
}

export async function createBriefing(userId: string, content: string) {
  const briefing = await prisma.briefing.create({
    data: {
      userId,
      content,
      date: new Date()
    }
  })

  pendoTrack('daily_briefing_generated', userId, 'system', {
    briefingContentLength: content.length,
    briefingDate: new Date().toISOString()
  })

  return briefing
}

export async function getTodayBriefing(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return prisma.briefing.findFirst({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  })
}

export async function createMeeting(data: {
  userId: string
  meetingUrl: string
  title: string
  startTime: Date
  endTime: Date
}) {
  const meeting = await prisma.meeting.create({
    data
  })

  const durationMinutes = Math.round(
    (data.endTime.getTime() - data.startTime.getTime()) / 60000
  )
  pendoTrack('meeting_created', data.userId, 'system', {
    meetingTitle: data.title,
    meetingUrl: data.meetingUrl,
    startTime: data.startTime.toISOString(),
    endTime: data.endTime.toISOString(),
    meetingDurationMinutes: durationMinutes
  })

  return meeting
}

export async function getUpcomingMeetings(userId: string, hoursAhead: number = 2) {
  const now = new Date()
  const future = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)
  
  return prisma.meeting.findMany({
    where: {
      userId,
      startTime: {
        gte: now,
        lte: future
      },
      attended: false
    },
    orderBy: { startTime: 'asc' }
  })
}
