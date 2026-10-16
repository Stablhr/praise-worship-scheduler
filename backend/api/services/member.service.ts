import {OAuth2Client} from 'google-auth-library';
import jwt from 'jsonwebtoken';
import {env} from '../config/env';
import {ApiError} from '../utils/error';
import {ErrorCodes} from '../constants/errorCodes';
import {
  MemberDocument,
  MemberPermission
} from '../models/Member.model';
import {memberRepository} from '../repositories/member.repository';

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

type GoogleProfile = {
  email: string;
  name: string;
  photoUrl?: string;
  googleId?: string;
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

function getGoogleClient(): OAuth2Client {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new ApiError(
      500,
      ErrorCodes.GOOGLE_NOT_CONFIGURED,
      'Google sign-in is not configured on the server'
    );
  }

  return new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET
  });
}

/** The popup flow sends an authorization code; the exchange happens here so the secret stays on the server. */
async function exchangeCodeForIdToken(
  client: OAuth2Client,
  code: string
): Promise<string> {
  try {
    const {tokens} = await client.getToken({
      code,
      redirect_uri: 'postmessage'
    });

    if (!tokens.id_token) {
      throw new ApiError(
        401,
        ErrorCodes.INVALID_GOOGLE_TOKEN,
        'Google did not return an identity token'
      );
    }

    return tokens.id_token;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      401,
      ErrorCodes.INVALID_GOOGLE_TOKEN,
      'Google authorization code is invalid or expired'
    );
  }
}

async function verifyIdToken(
  client: OAuth2Client,
  idToken: string
): Promise<GoogleProfile> {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new ApiError(
        401,
        ErrorCodes.INVALID_GOOGLE_TOKEN,
        'Google account has no email'
      );
    }

    if (payload.email_verified === false) {
      throw new ApiError(
        401,
        ErrorCodes.INVALID_GOOGLE_TOKEN,
        'Google account email is not verified'
      );
    }

    return {
      email: payload.email.toLowerCase(),
      name: payload.name?.trim() || payload.email.split('@')[0],
      photoUrl: payload.picture ?? undefined,
      googleId: payload.sub ?? undefined
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      401,
      ErrorCodes.INVALID_GOOGLE_TOKEN,
      'Google credential could not be verified'
    );
  }
}

/** Email a Chairman or Pastor gave for the very first admins (ADMIN_EMAILS). */
function getBootstrapAdminEmails(): string[] {
  return (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

function issueSessionTokens(member: MemberDocument) {
  const payload = {userId: member.id, type: 'member' as const};

  return {
    accessToken: jwt.sign(payload, env.JWT_SECRET, {expiresIn: '15m'}),
    refreshToken: jwt.sign(payload, env.JWT_REFRESH_SECRET, {expiresIn: '7d'})
  };
}

export const memberService = {
  async signInWithGoogle(input: {credential?: string; code?: string}) {
    const client = getGoogleClient();

    const idToken =
      input.credential ??
      (await exchangeCodeForIdToken(client, input.code as string));
    const profile = await verifyIdToken(client, idToken);

    const existing = await memberRepository.findByEmail(profile.email);

    if (!existing) {
      const isBootstrapAdmin = getBootstrapAdminEmails().includes(
        profile.email
      );

      if (!isBootstrapAdmin) {
        throw new ApiError(
          403,
          ErrorCodes.NOT_ON_TEAM_LIST,
          'This Google account is not on the team list'
        );
      }

      const member = await memberRepository.create({
        ...profile,
        permission: 'admin',
        pushTokens: []
      });

      return {member, ...issueSessionTokens(member)};
    }

    const member =
      (await memberRepository.syncGoogleProfile(existing.id, profile)) ??
      existing;

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
