"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceService = void 0;
exports.toServiceDto = toServiceDto;
const mongoose_1 = require("mongoose");
const error_1 = require("../utils/error");
const errorCodes_1 = require("../constants/errorCodes");
const serviceRoles_1 = require("../constants/serviceRoles");
const member_repository_1 = require("../repositories/member.repository");
const assignment_repository_1 = require("../repositories/assignment.repository");
const service_repository_1 = require("../repositories/service.repository");
const notification_service_1 = require("./notification.service");
const manila_1 = require("../utils/manila");
function toServiceDto(service) {
    return {
        id: service.id,
        type: service.type,
        date: (0, manila_1.manilaDateKey)(service.date),
        time: service.time,
        startsAt: service.date.toISOString(),
        notes: service.notes,
        photoUrl: service.photoUrl
    };
}
function toAssignedMemberDto(member) {
    return {
        id: member.id,
        name: member.name,
        position: member.position,
        photoUrl: member.photoUrl
    };
}
async function requireService(id) {
    const service = await service_repository_1.serviceRepository.findById(id);
    if (!service) {
        throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.SERVICE_NOT_FOUND, 'We could not find this service');
    }
    return service;
}
/** Every role of the service, in order, with the people serving it. */
async function buildRoles(service) {
    const assignments = await assignment_repository_1.assignmentRepository.listByService(service.id);
    const memberIds = [...new Set(assignments.map(a => a.memberId.toString()))];
    const members = await member_repository_1.memberRepository.listByIds(memberIds);
    const membersById = new Map(members.map(member => [member.id, member]));
    return (0, serviceRoles_1.getServiceRoles)(service.type).map(name => ({
        name,
        // An assignment whose member was removed simply drops out.
        members: assignments
            .filter(assignment => assignment.role === name)
            .map(assignment => membersById.get(assignment.memberId.toString()))
            .filter((member) => Boolean(member))
            .map(toAssignedMemberDto)
    }));
}
exports.serviceService = {
    /** The services of a range of Manila days, for the calendar. */
    async list(fromKey, toKey) {
        const from = (0, manila_1.manilaInstant)(fromKey);
        const to = (0, manila_1.manilaInstant)((0, manila_1.addDays)(toKey, 1));
        return service_repository_1.serviceRepository.listBetween(from, to);
    },
    /** One service with every role and who holds it, for the details screen. */
    async get(id) {
        const service = await requireService(id);
        return { service, roles: await buildRoles(service) };
    },
    async create(input) {
        const time = input.time ?? serviceRoles_1.DEFAULT_SERVICE_TIMES[input.type];
        const notes = input.notes?.trim();
        const data = {
            type: input.type,
            date: (0, manila_1.manilaInstant)(input.date, time),
            time
        };
        if (notes)
            data.notes = notes;
        return service_repository_1.serviceRepository.create(data);
    },
    async update(id, changes) {
        const service = await requireService(id);
        // A change to one of the pair keeps the other, so a notes edit never moves
        // the service and a time edit never changes the day.
        const dateKey = changes.date ?? (0, manila_1.manilaDateKey)(service.date);
        const time = changes.time ?? service.time;
        const type = changes.type ?? service.type;
        const update = {
            $set: { type, date: (0, manila_1.manilaInstant)(dateKey, time), time }
        };
        if (changes.notes !== undefined) {
            const notes = changes.notes.trim();
            if (notes)
                update.$set = { ...update.$set, notes };
            else
                update.$unset = { notes: 1 };
        }
        const updated = await service_repository_1.serviceRepository.updateById(id, update);
        if (!updated) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.SERVICE_NOT_FOUND, 'We could not find this service');
        }
        // The roles belong to the type, so a type change retires the old ones.
        if (changes.type && changes.type !== service.type) {
            await assignment_repository_1.assignmentRepository.deleteByRolesNotIn(id, (0, serviceRoles_1.getServiceRoles)(type));
        }
        return updated;
    },
    /** Removes a service and everything assigned to it. */
    async remove(id) {
        await requireService(id);
        await assignment_repository_1.assignmentRepository.deleteByService(id);
        await service_repository_1.serviceRepository.deleteById(id);
    },
    /** Sets or replaces the photo for a service. */
    async setPhoto(id, photoUrl) {
        await requireService(id);
        const updated = await service_repository_1.serviceRepository.updateById(id, {
            $set: { photoUrl }
        });
        if (!updated) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.SERVICE_NOT_FOUND, 'We could not find this service');
        }
        return updated;
    },
    /** Removes the photo from a service. */
    async removePhoto(id) {
        await requireService(id);
        const updated = await service_repository_1.serviceRepository.updateById(id, {
            $unset: { photoUrl: 1 }
        });
        if (!updated) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.SERVICE_NOT_FOUND, 'We could not find this service');
        }
        return updated;
    },
    /**
     * Replaces every assignment of one service. The admin sends the finished
     * picture, so a role they left empty is simply empty.
     */
    async setAssignments(id, entries) {
        const service = await requireService(id);
        const seenRoles = new Set();
        for (const entry of entries) {
            if (!(0, serviceRoles_1.isRoleForService)(service.type, entry.role)) {
                throw new error_1.ApiError(400, errorCodes_1.ErrorCodes.INVALID_ROLE, `"${entry.role}" is not a role of this service`);
            }
            if (seenRoles.has(entry.role)) {
                throw new error_1.ApiError(400, errorCodes_1.ErrorCodes.DUPLICATE_ROLE, `Only one member can hold "${entry.role}" for now`);
            }
            seenRoles.add(entry.role);
        }
        const memberIds = [...new Set(entries.map(entry => entry.memberId))];
        const malformed = memberIds.some(memberId => !(0, mongoose_1.isValidObjectId)(memberId));
        const members = malformed
            ? []
            : await member_repository_1.memberRepository.listByIds(memberIds);
        if (malformed || members.length !== memberIds.length) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.MEMBER_NOT_FOUND, 'One of the chosen members is no longer on the team list');
        }
        await assignment_repository_1.assignmentRepository.replaceForService(id, entries);
        // Notify all members that assignments changed.
        void notification_service_1.notificationService.notifyAssignmentsChanged(id);
        return buildRoles(service);
    },
    /**
     * Creates the next Saturdays and Sundays in one go, so an admin can fill in
     * two months in a single tap. Days that already have a service of that type
     * are left untouched, which makes the action safe to repeat.
     */
    async generateWeeks(weeks) {
        const todayKey = (0, manila_1.manilaDateKey)(new Date());
        const todayWeekday = (0, manila_1.getWeekday)(todayKey);
        // 0 means today already is that day, so today's service is included.
        const daysToSaturday = (6 - todayWeekday + 7) % 7;
        const daysToSunday = (0 - todayWeekday + 7) % 7;
        const wanted = [];
        for (let week = 0; week < weeks; week += 1) {
            wanted.push({
                type: 'saturday',
                dateKey: (0, manila_1.addDays)(todayKey, daysToSaturday + week * 7)
            });
            wanted.push({
                type: 'sunday',
                dateKey: (0, manila_1.addDays)(todayKey, daysToSunday + week * 7)
            });
        }
        // The Saturdays and Sundays of a week can fall in either order, so the
        // edge of the range has to be found, not assumed.
        const firstKey = wanted.reduce((earliest, item) => (item.dateKey < earliest ? item.dateKey : earliest), todayKey);
        const lastKey = wanted.reduce((latest, item) => (item.dateKey > latest ? item.dateKey : latest), todayKey);
        const existing = await service_repository_1.serviceRepository.listBetween((0, manila_1.manilaInstant)(firstKey), (0, manila_1.manilaInstant)((0, manila_1.addDays)(lastKey, 1)));
        const takenKeys = new Set(existing.map(service => `${service.type}:${(0, manila_1.manilaDateKey)(service.date)}`));
        const created = [];
        for (const item of wanted) {
            if (takenKeys.has(`${item.type}:${item.dateKey}`))
                continue;
            // Two services of the same type can never share a day.
            takenKeys.add(`${item.type}:${item.dateKey}`);
            created.push(await service_repository_1.serviceRepository.create({
                type: item.type,
                date: (0, manila_1.manilaInstant)(item.dateKey, serviceRoles_1.DEFAULT_SERVICE_TIMES[item.type]),
                time: serviceRoles_1.DEFAULT_SERVICE_TIMES[item.type]
            }));
        }
        return { created, skipped: wanted.length - created.length };
    }
};
