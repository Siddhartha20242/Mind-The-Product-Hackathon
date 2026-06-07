import Twilio from "twilio";
import { pendoTrack } from "../utils/pendo";

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSms(
  to: string,
  from: string,
  body: string,
  mediaUrl: string[] | undefined,
  visitorId: string,
  accountId: string
) {
  const result = await client.messages.create({
    to,
    from,
    body,
    mediaUrl,
  });

  // Track successful SMS send
  await pendoTrack("sms_sent", visitorId, accountId, {
    messageStatus: result.status,
    messageSegments: result.numSegments ? parseInt(result.numSegments, 10) : 1,
    destinationCountry: extractCountryCode(to),
    messageType: mediaUrl && mediaUrl.length > 0 ? "mms" : "sms",
  });

  return result;
}

export async function initiateCall(
  to: string,
  from: string,
  url: string,
  callType: string,
  visitorId: string,
  accountId: string
) {
  const result = await client.calls.create({
    to,
    from,
    url,
  });

  // Track successful call initiation
  await pendoTrack("call_initiated", visitorId, accountId, {
    callStatus: result.status,
    callDirection: "outbound",
    destinationCountry: extractCountryCode(to),
    callType,
  });

  return result;
}

function extractCountryCode(phoneNumber: string): string {
  if (phoneNumber.startsWith("+1")) return "US";
  if (phoneNumber.startsWith("+44")) return "GB";
  if (phoneNumber.startsWith("+")) return phoneNumber.substring(1, 3);
  return "unknown";
}
