import { OAuth2Client } from 'google-auth-library';

export type GoogleProfile = {
  googleId: string;
  email: string;
  fullName: string;
};

export function getGoogleClientId(): string | null {
  return process.env.GOOGLE_CLIENT_ID?.trim() || null;
}

export function isGoogleAuthConfigured(): boolean {
  return !!getGoogleClientId();
}

export async function verifyGoogleCredential(credential: string): Promise<GoogleProfile> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google sign-in is not configured on the server');
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error('Invalid Google sign-in response');
  }
  if (payload.email_verified === false) {
    throw new Error('Your Google email must be verified to sign up');
  }

  return {
    googleId: payload.sub,
    email: payload.email.trim().toLowerCase(),
    fullName: payload.name?.trim() || payload.email.split('@')[0] || 'Donor',
  };
}
