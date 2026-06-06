'use client';

import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '@/lib/api';
import type { AuthUser } from '@/lib/api';

type Props = {
  disabled?: boolean;
  onSuccess: (result: { token: string; user: AuthUser }) => void;
  onError: (message: string) => void;
};

export function ContinueWithGoogle({ disabled, onSuccess, onError }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

  if (!clientId) {
    if (process.env.NODE_ENV !== 'development') return null;
    return (
      <p className="small text-muted mb-0 text-center">
        Google sign-in is not configured. Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to{' '}
        <code>apps/web/.env.local</code> and <code>GOOGLE_CLIENT_ID</code> to <code>apps/api/.env</code>.
      </p>
    );
  }

  return (
    <div className="google-signin-block">
      <div className="google-signin-wrap">
        <GoogleLogin
          text="continue_with"
          shape="rectangular"
          theme="outline"
          size="large"
          width={360}
          onSuccess={async (res) => {
            if (disabled) return;
            const credential = res.credential;
            if (!credential) {
              onError('Google did not return a sign-in token');
              return;
            }
            try {
              const result = await loginWithGoogle(credential);
              onSuccess(result);
            } catch (err) {
              onError(err instanceof Error ? err.message : 'Google sign-in failed');
            }
          }}
          onError={() => onError('Google sign-in was cancelled or failed')}
        />
      </div>
      <div className="auth-divider" role="separator">
        <span>or</span>
      </div>
    </div>
  );
}
