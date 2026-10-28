"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberService = void 0;
exports.toMemberProfile = toMemberProfile;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const error_1 = require("../utils/error");
const errorCodes_1 = require("../constants/errorCodes");
const assignment_repository_1 = require("../repositories/assignment.repository");
const member_repository_1 = require("../repositories/member.repository");
const SALT_ROUNDS = 10;
function toMemberProfile(member) {
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
function issueSessionTokens(member) {
    const payload = { userId: member.id, type: 'member' };
    return {
        accessToken: jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: '15m' }),
        refreshToken: jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
    };
}
/** Emails a Chairman or Pastor gave in ADMIN_EMAILS, so the first admin can get in. */
function getBootstrapAdminEmails() {
    return (env_1.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean);
}
/** A self-registered song leader gets the song leader permission; the rest are members. */
function getPermissionForSignUp(email, position) {
    if (getBootstrapAdminEmails().includes(email))
        return 'admin';
    if (cleanPosition(position) === 'Song leader')
        return 'songleader';
    return 'member';
}
const ACCOUNT_NOT_FOUND_MESSAGE = 'We could not find an account with that email. Tap "Create an account" to make one.';
exports.memberService = {
    /**
     * Creates an account. Anyone in the ministry can sign themselves up, and an
     * admin can also add someone in advance (they then set a password here too).
     *
     * The position is the one the person chose, but a position an admin already
     * set is never overwritten. Admin is only ever granted by `ADMIN_EMAILS` or
     * by an existing admin on the Members screen.
     */
    async register(input) {
        const email = input.email.trim().toLowerCase();
        const position = cleanPosition(input.position);
        const existing = await member_repository_1.memberRepository.findByEmail(email);
        if (existing?.passwordHash) {
            throw new error_1.ApiError(409, errorCodes_1.ErrorCodes.ACCOUNT_EXISTS, 'This email already has an account. Please sign in instead.');
        }
        const passwordHash = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
        if (existing) {
            const member = (await member_repository_1.memberRepository.activate(existing.id, {
                name: input.name,
                passwordHash,
                position: existing.position ? undefined : position
            })) ?? existing;
            return { member, ...issueSessionTokens(member) };
        }
        const member = await member_repository_1.memberRepository.create({
            name: input.name.trim(),
            email,
            passwordHash,
            activatedAt: new Date(),
            position,
            permission: getPermissionForSignUp(email, position),
            pushTokens: []
        });
        return { member, ...issueSessionTokens(member) };
    },
    async login(input) {
        const email = input.email.trim().toLowerCase();
        const member = await member_repository_1.memberRepository.findByEmail(email);
        if (!member) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.ACCOUNT_NOT_FOUND, ACCOUNT_NOT_FOUND_MESSAGE);
        }
        if (!member.passwordHash) {
            throw new error_1.ApiError(403, errorCodes_1.ErrorCodes.ACCOUNT_NOT_ACTIVATED, 'This account has no password yet. Please use "Create an account" to set one.');
        }
        const matches = await bcrypt_1.default.compare(input.password, member.passwordHash);
        if (!matches) {
            throw new error_1.ApiError(401, errorCodes_1.ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password');
        }
        return { member, ...issueSessionTokens(member) };
    },
    async getProfile(memberId) {
        const member = await member_repository_1.memberRepository.findById(memberId);
        if (!member) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.MEMBER_NOT_FOUND, 'Member not found');
        }
        return member;
    },
    /** The whole team, for the Members screen. */
    async list() {
        return member_repository_1.memberRepository.list();
    },
    /**
     * Adds someone to the team list. They have no password yet, so they set one
     * themselves the first time they sign in (memberService.register).
     */
    async add(input) {
        const email = input.email.trim().toLowerCase();
        const existing = await member_repository_1.memberRepository.findByEmail(email);
        if (existing) {
            throw new error_1.ApiError(409, errorCodes_1.ErrorCodes.MEMBER_EXISTS, 'This email is already on the team list');
        }
        return member_repository_1.memberRepository.create({
            name: input.name.trim(),
            email,
            position: cleanPosition(input.position),
            permission: input.permission,
            passwordHash: null,
            activatedAt: null,
            pushTokens: []
        });
    },
    /** Edits name, position or permission. The email is the sign-in identity, so it is not editable here. */
    async update(memberId, changes) {
        const member = await member_repository_1.memberRepository.findById(memberId);
        if (!member) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.MEMBER_NOT_FOUND, 'Member not found');
        }
        if (changes.permission &&
            changes.permission !== 'admin' &&
            member.permission === 'admin') {
            await assertNotLastAdmin('There must always be at least one admin');
        }
        const update = {};
        if (changes.name !== undefined) {
            update.$set = { ...update.$set, name: changes.name.trim() };
        }
        if (changes.permission !== undefined) {
            update.$set = { ...update.$set, permission: changes.permission };
        }
        if (changes.position !== undefined) {
            const position = cleanPosition(changes.position);
            if (position) {
                update.$set = { ...update.$set, position };
            }
            else {
                update.$unset = { position: 1 };
            }
        }
        const updated = await member_repository_1.memberRepository.updateById(memberId, update);
        if (!updated) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.MEMBER_NOT_FOUND, 'Member not found');
        }
        return updated;
    },
    /** Removes a member for good, so they can no longer sign in. */
    async remove(memberId, actorId) {
        if (memberId === actorId) {
            throw new error_1.ApiError(400, errorCodes_1.ErrorCodes.CANNOT_REMOVE_SELF, 'You cannot remove your own account');
        }
        const member = await member_repository_1.memberRepository.findById(memberId);
        if (!member) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.MEMBER_NOT_FOUND, 'Member not found');
        }
        if (member.permission === 'admin') {
            await assertNotLastAdmin('There must always be at least one admin');
        }
        // Someone who left the team should not stay on the schedule.
        await assignment_repository_1.assignmentRepository.deleteByMember(memberId);
        await member_repository_1.memberRepository.deleteById(memberId);
    }
};
/** Empty or missing means the member has no position label yet. */
function cleanPosition(position) {
    const value = position?.trim();
    return value ? value : undefined;
}
async function assertNotLastAdmin(message) {
    const adminCount = await member_repository_1.memberRepository.countAdmins();
    if (adminCount <= 1) {
        throw new error_1.ApiError(409, errorCodes_1.ErrorCodes.LAST_ADMIN, message);
    }
}
