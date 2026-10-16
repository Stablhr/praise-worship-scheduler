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

/** The signed-in member. `type` is 'member' for the team members of this app. */
export type MeUser = {
  id: string;
  type: 'user' | 'admin' | 'member';
  name?: string;
  email?: string;
  permission?: MemberPermission;
  photoUrl?: string;
  position?: string;
};

export type MeResponse = {
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
 * Team member sign-in. Email and password, only for emails an admin added.
 */
export async function memberLogin(params: {email: string; password: string}) {
  const res = await httpClient.post<MeResponse>('/auth/member/login', params);
  return res.data;
}

/** First-time setup: the member sets their own name and password. */
export async function memberRegister(params: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await httpClient.post<MeResponse>(
    '/auth/member/register',
    params
  );
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
