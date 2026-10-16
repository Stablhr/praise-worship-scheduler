/**
 * Loads the Google Identity Services script and asks Google for an
 * authorization code. The code is sent to our backend, which exchanges it for
 * the member's Google profile. The client secret never reaches the browser.
 */

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export type GoogleCodeResponse = {
  code?: string;
  error?: string;
  error_description?: string;
};

type GoogleErrorResponse = {
  type: string;
  message?: string;
};

type GoogleCodeClient = {
  requestCode: () => void;
};

type GoogleAccounts = {
  oauth2: {
    initCodeClient: (config: {
      client_id: string;
      scope: string;
      ux_mode?: 'popup' | 'redirect';
      callback: (response: GoogleCodeResponse) => void;
      error_callback?: (error: GoogleErrorResponse) => void;
    }) => GoogleCodeClient;
  };
};

declare global {
  interface Window {
    google?: {accounts?: GoogleAccounts};
  }
}

/** Error codes the login screen knows how to explain to the member. */
export const GOOGLE_ERROR = {
  notConfigured: 'GOOGLE_NOT_CONFIGURED',
  scriptUnavailable: 'GOOGLE_SCRIPT_UNAVAILABLE',
  popupClosed: 'GOOGLE_POPUP_CLOSED',
  noCode: 'GOOGLE_NO_CODE'
} as const;

/** Shaped like the API errors so getFriendlyErrorMessage() can explain it. */
export class GoogleSignInError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'GoogleSignInError';
    this.code = code;
  }
}

export function getGoogleClientId(): string | null {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? null;
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${GSI_SCRIPT_SRC}"]`
  );

  if (existing?.dataset.loaded === 'true') return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const script = existing ?? document.createElement('script');

    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', () => {
      reject(new GoogleSignInError(GOOGLE_ERROR.scriptUnavailable));
    });

    if (!existing) {
      script.src = GSI_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
}

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = loadScript().catch(error => {
      // Allow a retry after a network failure
      scriptPromise = null;
      throw error;
    });
  }
  return scriptPromise;
}

/** Opens the Google account popup and resolves with the authorization code. */
export async function requestGoogleAuthCode(): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) throw new GoogleSignInError(GOOGLE_ERROR.notConfigured);

  await loadGoogleIdentityScript();

  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new GoogleSignInError(GOOGLE_ERROR.scriptUnavailable);

  return new Promise<string>((resolve, reject) => {
    const client = oauth2.initCodeClient({
      client_id: clientId,
      scope: 'openid email profile',
      ux_mode: 'popup',
      callback: response => {
        if (response.code) {
          resolve(response.code);
          return;
        }
        reject(new GoogleSignInError(response.error ?? GOOGLE_ERROR.noCode));
      },
      error_callback: error =>
        reject(new GoogleSignInError(error.type, error.message))
    });

    client.requestCode();
  });
}
