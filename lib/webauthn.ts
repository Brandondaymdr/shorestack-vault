// ============================================
// ShoreStack Vault — WebAuthn Helpers
// ============================================
// Registration and authentication for biometric unlock.
// Uses platform authenticators only (Touch ID, Face ID, Windows Hello).

import { bufferToBase64, base64ToBuffer } from '@/lib/crypto';

// --- Feature Detection ---

export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// --- Registration (Enrollment) ---

export interface WebAuthnRegistrationResult {
  credentialId: string;
  publicKey: string;
  transports: string[];
}

export async function registerBiometric(
  userId: string,
  userEmail: string
): Promise<WebAuthnRegistrationResult> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: 'ShoreStack Vault',
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: userEmail,
        displayName: userEmail.split('@')[0],
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },   // ES256
        { alg: -257, type: 'public-key' },  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    },
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error('Biometric registration cancelled');
  }

  const response = credential.response as AuthenticatorAttestationResponse;

  // Extract public key from attestation
  const publicKeyBytes = response.getPublicKey?.();
  if (!publicKeyBytes) {
    throw new Error('Could not extract public key from credential');
  }

  const transports = response.getTransports?.() || [];

  return {
    credentialId: bufferToBase64(credential.rawId),
    publicKey: bufferToBase64(publicKeyBytes),
    transports: transports as string[],
  };
}

// --- Authentication (Unlock) ---

export interface WebAuthnAssertionResult {
  credentialId: string;
  authenticatorData: ArrayBuffer;
  clientDataJSON: ArrayBuffer;
  signature: ArrayBuffer;
}

export async function authenticateBiometric(
  credentialId: string
): Promise<WebAuthnAssertionResult> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const credential = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [
        {
          id: base64ToBuffer(credentialId),
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      timeout: 60000,
    },
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error('Biometric authentication cancelled');
  }

  const response = credential.response as AuthenticatorAssertionResponse;

  return {
    credentialId: bufferToBase64(credential.rawId),
    authenticatorData: response.authenticatorData,
    clientDataJSON: response.clientDataJSON,
    signature: response.signature,
  };
}
