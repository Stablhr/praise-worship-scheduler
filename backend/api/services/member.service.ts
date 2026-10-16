import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {env} from '../config/env';
import {ApiError} from '../utils/error';
import {ErrorCodes} from '../constants/errorCodes';
import {MemberDocument, MemberPermission} from '../models/Member.model';
import {memberRepository} from '../repositories/member.repository';

const SALT_ROUNDS = 10;

/** Shape returned to the app for the signed-in member. */
export type MemberProfile = {
  id: string;
  type: 'member';
  name: string;
  email: string;
  permission: MemberPermission;
  photoUrl?: string;
  position?: string;
};

export function toMemberProfile(member: MemberDocument): MemberProfile {
  return {
    id: member.id,
    type: 'member',
    name: member.name,
    email: member.email,
    permission: member.permission,
    photoUrl: member.photoUrl,
    position: member.position
  };
}

function issueSessionTokens(member: MemberDocument) {
  const payload = {userId: member.id, type: 'member' as const};

  return {
    accessToken: jwt.sign(payload, env.JWT_SECRET, {expiresIn: '15m'}),
    refreshToken: jwt.sign(payload, env.JWT_REFRESH_SECRET, {expiresIn: '7d'})
  };
}

/** Emails a Chairman or Pastor gave in ADMIN_EMAILS, so the first admin can get in. */
function getBootstrapAdminEmails(): string[] {
  return (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

const NOT_ON_TEAM_LIST_MESSAGE =
  'This email is not on the team list. Please ask the Chairman or Pastor to add you.';

export const memberService = {
  /**
   * First-time setup. Only works for an email an admin already added
   * (or one of the ADMIN_EMAILS, which becomes the first admin).
   */
  async register(input: {name: string; email: string; password: string}) {
    const email = input.email.trim().toLowerCase();
    const existing = await memberRepository.findByEmail(email);

    if (existing?.passwordHash) {
      throw new ApiError(
        409,
        ErrorCodes.ACCOUNT_EXISTS,
        'This email already has an account. Please sign in instead.'
      );
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    if (existing) {
      const member =
        (await memberRepository.activate(existing.id, {
          name: input.name,
          passwordHash
        })) ?? existing;

      return {member, ...issueSessionTokens(member)};
    }

    if (!getBootstrapAdminEmails().includes(email)) {
      throw new ApiError(403, ErrorCodes.NOT_ON_TEAM_LIST, NOT_ON_TEAM_LIST_MESSAGE);
    }

    const member = await memberRepository.create({
      name: input.name,
      email,
      passwordHash,
      activatedAt: new Date(),
      permission: 'admin',
      pushTokens: []
    });

    return {member, ...issueSessionTokens(member)};
  },

  async login(input: {email: string; password: string}) {
    const email = input.email.trim().toLowerCase();
    const member = await memberRepository.findByEmail(email);

    if (!member) {
      throw new ApiError(403, ErrorCodes.NOT_ON_TEAM_LIST, NOT_ON_TEAM_LIST_MESSAGE);
    }

    if (!member.passwordHash) {
      throw new ApiError(
        403,
        ErrorCodes.ACCOUNT_NOT_ACTIVATED,
        'This account has no password yet. Please use "First time here?" to set one.'
      );
    }

    const matches = await bcrypt.compare(input.password, member.passwordHash);
    if (!matches) {
      throw new ApiError(
        401,
        ErrorCodes.INVALID_CREDENTIALS,
        'Invalid email or password'
      );
    }

    return {member, ...issueSessionTokens(member)};
  },

  async getProfile(memberId: string): Promise<MemberDocument> {
    const member = await memberRepository.findById(memberId);

    if (!member) {
      throw new ApiError(404, ErrorCodes.MEMBER_NOT_FOUND, 'Member not found');
    }

    return member;
  }
};
