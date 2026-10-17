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

export async function getMe() {
  const res = await httpClient.get<MeResponse>('/auth/me');
  return res.data;
}
