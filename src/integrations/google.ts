import { google } from "googleapis";
import { pendoTrack } from "../utils/pendo";

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const calendar = google.calendar({ version: "v3", auth });
const gmail = google.gmail({ version: "v1", auth });
const drive = google.drive({ version: "v3", auth });

export async function createCalendarEvent(
  calendarId: string,
  summary: string,
  start: string,
  end: string,
  attendees: string[],
  recurrence: string[] | undefined,
  reminders: any,
  visitorId: string,
  accountId: string
) {
  const result = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      start: { dateTime: start },
      end: { dateTime: end },
      attendees: attendees.map((email) => ({ email })),
      recurrence,
      reminders,
    },
  });

  const startDate = new Date(start);
  const endDate = new Date(end);
  const eventDuration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  // Track successful calendar event creation
  await pendoTrack("google_calendar_event_created", visitorId, accountId, {
    calendarId,
    eventDuration,
    hasAttendees: attendees.length > 0,
    attendeeCount: attendees.length,
    isRecurring: !!recurrence && recurrence.length > 0,
    hasReminder: !!reminders,
  });

  return result.data;
}

export async function sendEmail(
  to: string[],
  subject: string,
  body: string,
  cc: string[],
  bcc: string[],
  attachments: any[],
  threadId: string | undefined,
  visitorId: string,
  accountId: string
) {
  const rawMessage = createRawEmail(to, subject, body, cc, bcc, attachments);

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawMessage,
      threadId,
    },
  });

  // Track successful email send
  await pendoTrack("google_email_sent", visitorId, accountId, {
    recipientCount: to.length,
    hasCc: cc.length > 0,
    hasBcc: bcc.length > 0,
    hasAttachments: attachments.length > 0,
    attachmentCount: attachments.length,
    isReply: !!threadId,
  });

  return result.data;
}

export async function uploadFileToDrive(
  fileName: string,
  mimeType: string,
  fileContent: Buffer,
  folderId: string | undefined,
  shared: boolean,
  visitorId: string,
  accountId: string
) {
  const startTime = Date.now();

  const result = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType,
      parents: folderId ? [folderId] : undefined,
    },
    media: {
      mimeType,
      body: fileContent as any,
    },
  });

  if (shared && result.data.id) {
    await drive.permissions.create({
      fileId: result.data.id,
      requestBody: { role: "reader", type: "anyone" },
    });
  }

  const uploadDuration = Date.now() - startTime;

  // Track successful file upload
  await pendoTrack("google_drive_file_uploaded", visitorId, accountId, {
    fileType: mimeType,
    fileSize: fileContent.length,
    folderId: folderId || "",
    isShared: shared,
    uploadDuration,
  });

  return result.data;
}

function createRawEmail(
  to: string[],
  subject: string,
  body: string,
  cc: string[],
  bcc: string[],
  attachments: any[]
): string {
  const headers = [
    `To: ${to.join(", ")}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=utf-8`,
  ];
  if (cc.length > 0) headers.push(`Cc: ${cc.join(", ")}`);
  if (bcc.length > 0) headers.push(`Bcc: ${bcc.join(", ")}`);

  const email = `${headers.join("\r\n")}\r\n\r\n${body}`;
  return Buffer.from(email).toString("base64url");
}
