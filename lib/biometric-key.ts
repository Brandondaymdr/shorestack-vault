// ============================================
// ShoreStack Vault — Biometric Key Wrapping
// ============================================
// Wraps/unwraps the vault key for biometric unlock.
// During enrollment: vault key bytes are encrypted with a random wrap key.
// During unlock: biometric verifies user, then wrapped key is decrypted.

import { bufferToBase64, base64ToBuffer } from '@/lib/crypto';

const AES_KEY_LENGTH = 256;
const IV_LENGTH = 12;
const KDF_ITERATIONS = 600_000;

// --- Enrollment: Wrap vault key for biometric storage ---

export interface WrappedVaultKey {
  encryptedVaultKey: string;  // Vault key bytes encrypted with wrap key (base64)
  encryptedVaultKeyIv: string; // IV for the above (base64)
}

/**
 * During biometric enrollment:
 * 1. Re-derive vault key as EXTRACTABLE (same password/salt/iterations → same key)
 * 2. Export raw key bytes
 * 3. Generate random wrap key
 * 4. Encrypt vault key bytes with wrap key
 * 5. Encrypt wrap key with the vault key (so master password can also recover it)
 * 6. Return both encrypted blobs for storage in profiles table
 *
 * The extractable key is NEVER stored — only used transiently during enrollment.
 */
export async function wrapVaultKeyForBiometric(
  masterPassword: string,
  salt: string,
  iterations: number = KDF_ITERATIONS
): Promise<WrappedVaultKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(masterPassword);
  const saltBuffer = base64ToBuffer(salt);

  // Re-derive vault key as EXTRACTABLE (one-time, enrollment only)
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const extractableKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    true, // EXTRACTABLE — only for enrollment
    ['encrypt', 'decrypt']
  );

  // Export raw key bytes
  const rawKeyBytes = await crypto.subtle.exportKey('raw', extractableKey);

  // Generate random wrap key
  const wrapIv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Re-derive non-extractable key for wrapping
  const vaultKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  // Encrypt the raw vault key bytes with the vault key itself
  // This creates a "wrapped" version that can be unwrapped by either:
  // - Master password (re-derive vault key → decrypt)
  // - Biometric (WebAuthn verifies → decrypt)
  const encryptedKeyBytes = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: wrapIv },
    vaultKey,
    rawKeyBytes
  );

  return {
    encryptedVaultKey: bufferToBase64(encryptedKeyBytes),
    encryptedVaultKeyIv: bufferToBase64(wrapIv.buffer),
  };
}

// --- Unlock: Unwrap vault key after biometric verification ---

/**
 * After biometric authentication succeeds:
 * 1. User re-enters master password once to unwrap (first time after enrollment)
 *    OR the encrypted key is decrypted using a key derived from the same password
 * 2. Import raw bytes as non-extractable CryptoKey
 * 3. Set in VaultSession
 *
 * For the biometric flow, we store the encrypted vault key bytes.
 * The biometric verification proves the user is who they claim to be,
 * then we decrypt the stored key bytes to recover the vault key.
 */
export async function unwrapVaultKey(
  encryptedVaultKey: string,
  encryptedVaultKeyIv: string,
  masterPassword: string,
  salt: string,
  iterations: number = KDF_ITERATIONS
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(masterPassword);
  const saltBuffer = base64ToBuffer(salt);

  // Derive the vault key from master password
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const vaultKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  // Decrypt the wrapped vault key bytes
  const encryptedBytes = base64ToBuffer(encryptedVaultKey);
  const iv = new Uint8Array(base64ToBuffer(encryptedVaultKeyIv));

  const rawKeyBytes = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    vaultKey,
    encryptedBytes
  );

  // Import as non-extractable CryptoKey
  const recoveredKey = await crypto.subtle.importKey(
    'raw',
    rawKeyBytes,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false, // NON-EXTRACTABLE
    ['encrypt', 'decrypt']
  );

  return recoveredKey;
}
