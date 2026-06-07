const PENDO_TRACK_URL = "https://data.pendo.io/data/track";
const PENDO_INTEGRATION_KEY = "e6587476-98e5-4629-b54c-d2a7765fce13";

interface PendoTrackEvent {
  type: "track";
  event: string;
  visitorId: string;
  accountId: string;
  timestamp: number;
  properties?: Record<string, string | number | boolean>;
  context?: {
    ip?: string;
    userAgent?: string;
    url?: string;
    title?: string;
  };
}

export async function pendoTrack(
  eventName: string,
  visitorId: string,
  accountId: string,
  properties?: Record<string, string | number | boolean>,
  context?: PendoTrackEvent["context"]
): Promise<void> {
  const payload: PendoTrackEvent = {
    type: "track",
    event: eventName,
    visitorId,
    accountId,
    timestamp: Date.now(),
    properties,
    context,
  };

  try {
    const response = await fetch(PENDO_TRACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pendo-integration-key": PENDO_INTEGRATION_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Pendo track failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Pendo track error:", error);
  }
}
