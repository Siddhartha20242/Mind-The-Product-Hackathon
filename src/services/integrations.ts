import { pendoTrack } from "../utils/pendo";

interface IntegrationConfig {
  name: string;
  authMethod: "oauth" | "api_key";
  credentials: Record<string, string>;
  scopes?: string[];
}

export async function connectIntegration(
  config: IntegrationConfig,
  visitorId: string,
  accountId: string
) {
  const startTime = Date.now();

  // Validate credentials based on auth method
  if (config.authMethod === "oauth") {
    await validateOAuthFlow(config);
  } else {
    await validateApiKey(config);
  }

  const setupDuration = Date.now() - startTime;

  // Track successful integration connection
  await pendoTrack("integration_connected", visitorId, accountId, {
    integrationName: config.name,
    authMethod: config.authMethod,
    setupDuration,
    scopesGranted: config.scopes?.join(",") || "",
  });

  return { connected: true, integration: config.name };
}

export async function disconnectIntegration(
  integrationName: string,
  connectionDuration: number,
  reason: string,
  visitorId: string,
  accountId: string
) {
  // Revoke credentials (application logic here)
  await revokeCredentials(integrationName);

  // Track integration disconnection
  await pendoTrack("integration_disconnected", visitorId, accountId, {
    integrationName,
    connectionDuration,
    reason,
  });

  return { disconnected: true, integration: integrationName };
}

async function validateOAuthFlow(config: IntegrationConfig): Promise<void> {
  // OAuth validation logic
}

async function validateApiKey(config: IntegrationConfig): Promise<void> {
  // API key validation logic
}

async function revokeCredentials(integrationName: string): Promise<void> {
  // Credential revocation logic
}
