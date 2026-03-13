'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { authenticateBiometric } from '@/lib/webauthn';
import { unwrapVaultKey } from '@/lib/biometric-key';

interface BiometricUnlockProps {
  onSuccess: (vaultKey: CryptoKey) => void;
  credentialId: string;
  encryptedVaultKey: string;
  encryptedVaultKeyIv: string;
  kdfSalt: string;
  kdfIterations: number;
}

export default function BiometricUnlock({
  onSuccess,
  credentialId,
  encryptedVaultKey,
  encryptedVaultKeyIv,
  kdfSalt,
  kdfIterations,
}: BiometricUnlockProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failCount, setFailCount] = useState(0);

  // Hide after 3 failures
  if (failCount >= 3) return null;

  async function handleBiometricUnlock() {
    setError('');
    setLoading(true);

    try {
      // Step 1: Verify biometric (Touch ID / Face ID / Windows Hello)
      await authenticateBiometric(credentialId);

      // Step 2: We need the master password to unwrap the key.
      // In the biometric flow, the wrapped key was encrypted with the vault key,
      // which is derived from the master password. For a true "passwordless" experience,
      // we'd need to store a separate unwrap key. For now, the biometric verification
      // serves as the user verification step, and we use the stored wrapped key.
      //
      // Note: The current implementation still requires the master password for the
      // first unlock after each session. Biometric serves as a quick re-unlock after
      // auto-lock (within the same browser session where the key is cached).
      //
      // TODO: In a future iteration, use a device-bound key (from WebAuthn PRF extension
      // or a separate symmetric key stored in platform keychain) for true passwordless unlock.

      // For now, this component is used alongside the master password entry.
      // The biometric verification proves the user's identity, then the vault key
      // is unwrapped using stored credentials.

      // Since we can't do true passwordless without PRF extension support,
      // we'll request the master password from the parent component
      setError('Biometric verified — enter master password to complete unlock');
      setLoading(false);

    } catch (err) {
      setFailCount((c) => c + 1);
      setError(err instanceof Error ? err.message : 'Biometric failed');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleBiometricUnlock}
        disabled={loading}
        className="flex items-center gap-2 rounded-sm border border-[#1b4965]/15 px-4 py-2.5 text-sm text-[#1b4965]/70 transition-colors hover:bg-[#1b4965]/5 disabled:opacity-50"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#5fa8a0] border-t-transparent" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 10V14M18 12a6 6 0 11-12 0 6 6 0 0112 0z" />
            <path d="M7 3.34V5a3 3 0 003 3h4a3 3 0 003-3V3.34" />
            <path d="M12 22v-4" />
            <path d="M17 20.66V19a3 3 0 00-3-3h-4a3 3 0 00-3 3v1.66" />
          </svg>
        )}
        {loading ? 'Verifying...' : 'Unlock with Biometric'}
      </button>
      {error && (
        <p className="text-xs text-[#e76f51]">{error}</p>
      )}
      {failCount > 0 && failCount < 3 && (
        <p className="text-[10px] text-[#1b4965]/40">
          {3 - failCount} attempts remaining
        </p>
      )}
    </div>
  );
}
