import {httpClient} from './httpClient';
import type {MemberPermission} from './authApi';

/** One row on the Members screen. Matches MemberProfile on the server. */
export type MemberSummary = {
  id: string;
  type: 'member';
  name: string;
  email: string;
  permission: MemberPermission;
  position?: string;
  photoUrl?: string;
};

export type NewMember = {
  name: string;
  email: string;
  position?: string;
  permission: MemberPermission;
};

/** The email is the sign-in identity, so it is not editable after adding. */
export type MemberChanges = {
  name?: string;
  position?: string;
  permission?: MemberPermission;
};

export async function listMembers(): Promise<MemberSummary[]> {
  const res = await httpClient.get<{members: MemberSummary[]}>('/members');
  return res.data.members;
}

export async function addMember(input: NewMember): Promise<MemberSummary> {
  const res = await httpClient.post<{member: MemberSummary}>('/members', input);
  return res.data.member;
}

export async function updateMember(
  id: string,
  changes: MemberChanges
): Promise<MemberSummary> {
  const res = await httpClient.patch<{member: MemberSummary}>(
    `/members/${id}`,
    changes
  );
  return res.data.member;
}

export async function removeMember(id: string): Promise<void> {
  await httpClient.delete(`/members/${id}`);
}
