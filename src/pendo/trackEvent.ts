const PENDO_TRACK_URL = 'https://data.pendo.io/data/track'
const PENDO_INTEGRATION_KEY = '6eabeb41-4fdd-46cb-bb39-4c6ab1f3831f'

export async function pendoTrack(
  event: string,
  visitorId: string,
  accountId: string,
  properties: Record<string, string | number | boolean> = {}
): Promise<void> {
  try {
    await fetch(PENDO_TRACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pendo-integration-key': PENDO_INTEGRATION_KEY
      },
      body: JSON.stringify({
        type: 'track',
        event,
        visitorId,
        accountId,
        timestamp: Date.now(),
        properties
      })
    })
  } catch (error) {
    console.error(`[Pendo] Failed to track event "${event}":`, error)
  }
}
