import {httpClient} from './httpClient';

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
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notificationsEnabled?: boolean;
  };
};

export type MeResponse = {
  user: MeUser;
};

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

/**
 * Creates the account behind an email: a person signing themselves up, or a
 * member an admin added in advance. They choose their name and password.
 */
export async function memberRegister(params: {
  name: string;
  email: string;
  password: string;
  position: string;
}) {
  const res = await httpClient.post<MeResponse>(
    '/auth/member/register',
    params
  );
  return res.data;
}

export async function getMe() {
  const res = await httpClient.get<MeResponse>('/auth/me');
  return res.data;
}

export async function updateMe(changes: {
  name?: string;
  photoUrl?: string;
  position?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notificationsEnabled?: boolean;
  };
}): Promise<MeResponse> {
  const res = await httpClient.patch<MeResponse>('/auth/me', changes);
  return res.data;
}

export async function uploadProfilePhoto(file: File | Blob): Promise<MeResponse> {
  const formData = new FormData();
  formData.append('photo', file);

  const res = await httpClient.post<MeResponse>('/auth/me/photo', formData, {
    headers: {'Content-Type': 'multipart/form-data'}
  });
  return res.data;
}

export async function removeProfilePhoto(): Promise<MeResponse> {
  const res = await httpClient.delete<MeResponse>('/auth/me/photo');
  return res.data;
}
