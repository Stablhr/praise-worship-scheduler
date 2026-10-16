import {httpClient} from './httpClient';

type RegisterRequest = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

type RegisterResponse = {
  id: string;
  email: string;
};

type LoginResponse = {
  user: {
    id: string;
    email: string;
    type: 'admin' | 'user';
  };
};
type LogoutResponse = {message: string};

export type MemberPermission = 'admin' | 'songleader' | 'member';

/** The signed-in member. `type` is 'member' for people who signed in with Google. */
export type MeUser = {
  id: string;
  type: 'user' | 'admin' | 'member';
  name?: string;
  email?: string;
  permission?: MemberPermission;
  photoUrl?: string;
  position?: string;
};

type MeResponse = {
  user: MeUser;
};

export async function registerCustomer(data: RegisterRequest) {
  const res = await httpClient.post<RegisterResponse>('/auth/register', data);
  return res.data;
}

export async function verifyCustomerEmail(params: {
  email: string;
  code: string;
}) {
  const res = await httpClient.post<{message: string}>('/auth/verify', params);
  return res.data;
}

export async function resendVerificationCode(params: {email: string}) {
  const res = await httpClient.post<{message: string}>(
    '/auth/resend-verification',
    params
  );
  return res.data;
}

export async function login(params: {email: string; password: string}) {
  const res = await httpClient.post<LoginResponse>('/auth/login', params);
  return res.data;
}

export async function logout() {
  const res = await httpClient.post<LogoutResponse>('/auth/logout');
  return res.data;
}

/**
 * Signs in with Google. Send either the authorization code from the Google
 * popup or an ID token (used by the Capacitor plugin from Phase 8 onwards).
 */
export async function signInWithGoogle(params: {
  credential?: string;
  code?: string;
}) {
  const res = await httpClient.post<MeResponse>('/auth/google', params);
  return res.data;
}

export async function sendPasswordResetCode(params: {email: string}) {
  const res = await httpClient.post<{message: string}>(
    '/auth/forgot-password',
    params
  );
  return res.data;
}

export async function resendPasswordResetCode(params: {email: string}) {
  const res = await httpClient.post<{message: string}>(
    '/auth/resend-reset-code',
    params
  );
  return res.data;
}

export async function verifyPasswordResetCode(params: {
  email: string;
  code: string;
}) {
  const res = await httpClient.post<{message: string}>(
    '/auth/verify-reset-code',
    params
  );
  return res.data;
}

export async function resetPassword(params: {
  email: string;
  code: string;
  newPassword: string;
}) {
  const res = await httpClient.post<{message: string}>(
    '/auth/reset-password',
    params
  );
  return res.data;
}


export async function getMe() {
  const res = await httpClient.get<MeResponse>('/auth/me');
  return res.data;
}

export async function changePassword(params: {
  currentPassword: string;
  newPassword: string;
}) {
  const res = await httpClient.put<{message: string}>(
    '/auth/password',
    params
  );
  return res.data;
}
