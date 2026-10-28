"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberController = void 0;
const member_service_1 = require("../services/member.service");
/**
 * Members routes are thin (backend/AGENTS.md): validate in the route, decide in
 * the service, shape the response here. `req.member` is set by requirePermission
 * on the admin-only routes.
 */
exports.memberController = {
    async list(_req, res, next) {
        try {
            const members = await member_service_1.memberService.list();
            res.status(200).json({ members: members.map(member_service_1.toMemberProfile) });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const member = await member_service_1.memberService.add(req.body);
            res.status(201).json({ member: (0, member_service_1.toMemberProfile)(member) });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const member = await member_service_1.memberService.update(req.params.id, req.body);
            res.status(200).json({ member: (0, member_service_1.toMemberProfile)(member) });
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await member_service_1.memberService.remove(req.params.id, req.member?.id ?? '');
            res.status(200).json({ message: 'Member removed' });
        }
        catch (error) {
            next(error);
        }
    }
};
