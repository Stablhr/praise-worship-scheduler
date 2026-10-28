import {isValidObjectId, UpdateQuery} from 'mongoose';
import {ApiError} from '../utils/error';
import {ErrorCodes} from '../constants/errorCodes';
import {
  DEFAULT_SERVICE_TIMES,
  getServiceRoles,
  isRoleForService
} from '../constants/serviceRoles';
import {MemberDocument} from '../models/Member.model';
import {ServiceDocument, ServiceType} from '../models/Service.model';
import {memberRepository} from '../repositories/member.repository';
import {
  AssignmentEntry,
  assignmentRepository
} from '../repositories/assignment.repository';
import {serviceRepository} from '../repositories/service.repository';
import {addDays, getWeekday, manilaDateKey, manilaInstant} from '../utils/manila';
import type {
  CreateServiceDto,
  UpdateServiceDto
} from '../dtos/service.dto';

/** One service as the app receives it. */
export type ServiceDto = {
  id: string;
  type: ServiceType;
  /** Manila calendar day, YYYY-MM-DD. */
  date: string;
  /** Manila start time, HH:mm. */
  time: string;
  /** The exact start instant, stored in UTC. */
  startsAt: string;
  notes?: string;
  photoUrl?: string;
};

/** A person serving a role. */
export type AssignedMemberDto = {
  id: string;
  name: string;
  position?: string;
  photoUrl?: string;
};

/**
 * One role of the service and who holds it, in the order the service runs.
 * `members` holds at most one person for now, but stays a list so a repeatable
 * role (more than one Guitarist) needs no shape change later.
 */
export type ServiceRoleDto = {
  name: string;
  members: AssignedMemberDto[];
};

export function toServiceDto(service: ServiceDocument): ServiceDto {
  return {
    id: service.id,
    type: service.type,
    date: manilaDateKey(service.date),
    time: service.time,
    startsAt: service.date.toISOString(),
    notes: service.notes,
    photoUrl: service.photoUrl
  };
}

function toAssignedMemberDto(member: MemberDocument): AssignedMemberDto {
  return {
    id: member.id,
    name: member.name,
    position: member.position,
    photoUrl: member.photoUrl
  };
}

async function requireService(id: string): Promise<ServiceDocument> {
  const service = await serviceRepository.findById(id);

  if (!service) {
    throw new ApiError(
      404,
      ErrorCodes.SERVICE_NOT_FOUND,
      'We could not find this service'
    );
  }

  return service;
}

/** Every role of the service, in order, with the people serving it. */
async function buildRoles(service: ServiceDocument): Promise<ServiceRoleDto[]> {
  const assignments = await assignmentRepository.listByService(service.id);
  const memberIds = [...new Set(assignments.map(a => a.memberId.toString()))];
  const members = await memberRepository.listByIds(memberIds);
  const membersById = new Map<string, MemberDocument>(
    members.map(member => [member.id, member])
  );

  return getServiceRoles(service.type).map(name => ({
    name,
    // An assignment whose member was removed simply drops out.
    members: assignments
      .filter(assignment => assignment.role === name)
      .map(assignment => membersById.get(assignment.memberId.toString()))
      .filter((member): member is MemberDocument => Boolean(member))
      .map(toAssignedMemberDto)
  }));
}

export const serviceService = {
  /** The services of a range of Manila days, for the calendar. */
  async list(fromKey: string, toKey: string): Promise<ServiceDocument[]> {
    const from = manilaInstant(fromKey);
    const to = manilaInstant(addDays(toKey, 1));

    return serviceRepository.listBetween(from, to);
  },

  /** One service with every role and who holds it, for the details screen. */
  async get(
    id: string
  ): Promise<{service: ServiceDocument; roles: ServiceRoleDto[]}> {
    const service = await requireService(id);

    return {service, roles: await buildRoles(service)};
  },

  async create(input: CreateServiceDto): Promise<ServiceDocument> {
    const time = input.time ?? DEFAULT_SERVICE_TIMES[input.type];
    const notes = input.notes?.trim();

    const data: Partial<ServiceDocument> = {
      type: input.type,
      date: manilaInstant(input.date, time),
      time
    };

    if (notes) data.notes = notes;

    return serviceRepository.create(data);
  },

  async update(
    id: string,
    changes: UpdateServiceDto
  ): Promise<ServiceDocument> {
    const service = await requireService(id);

    // A change to one of the pair keeps the other, so a notes edit never moves
    // the service and a time edit never changes the day.
    const dateKey = changes.date ?? manilaDateKey(service.date);
    const time = changes.time ?? service.time;
    const type = changes.type ?? service.type;

    const update: UpdateQuery<ServiceDocument> = {
      $set: {type, date: manilaInstant(dateKey, time), time}
    };

    if (changes.notes !== undefined) {
      const notes = changes.notes.trim();

      if (notes) update.$set = {...update.$set, notes};
      else update.$unset = {notes: 1};
    }

    const updated = await serviceRepository.updateById(id, update);

    if (!updated) {
      throw new ApiError(
        404,
        ErrorCodes.SERVICE_NOT_FOUND,
        'We could not find this service'
      );
    }

    // The roles belong to the type, so a type change retires the old ones.
    if (changes.type && changes.type !== service.type) {
      await assignmentRepository.deleteByRolesNotIn(
        id,
        getServiceRoles(type)
      );
    }

    return updated;
  },

  /** Removes a service and everything assigned to it. */
  async remove(id: string): Promise<void> {
    await requireService(id);

    await assignmentRepository.deleteByService(id);
    await serviceRepository.deleteById(id);
  },

  /** Sets or replaces the photo for a service. */
  async setPhoto(id: string, photoUrl: string): Promise<ServiceDocument> {
    await requireService(id);

    const updated = await serviceRepository.updateById(id, {
      $set: {photoUrl}
    });

    if (!updated) {
      throw new ApiError(
        404,
        ErrorCodes.SERVICE_NOT_FOUND,
        'We could not find this service'
      );
    }

    return updated;
  },

  /** Removes the photo from a service. */
  async removePhoto(id: string): Promise<ServiceDocument> {
    await requireService(id);

    const updated = await serviceRepository.updateById(id, {
      $unset: {photoUrl: 1}
    });

    if (!updated) {
      throw new ApiError(
        404,
        ErrorCodes.SERVICE_NOT_FOUND,
        'We could not find this service'
      );
    }

    return updated;
  },

  /**
   * Replaces every assignment of one service. The admin sends the finished
   * picture, so a role they left empty is simply empty.
   */
  async setAssignments(
    id: string,
    entries: AssignmentEntry[]
  ): Promise<ServiceRoleDto[]> {
    const service = await requireService(id);
    const seenRoles = new Set<string>();

    for (const entry of entries) {
      if (!isRoleForService(service.type, entry.role)) {
        throw new ApiError(
          400,
          ErrorCodes.INVALID_ROLE,
          `"${entry.role}" is not a role of this service`
        );
      }

      if (seenRoles.has(entry.role)) {
        throw new ApiError(
          400,
          ErrorCodes.DUPLICATE_ROLE,
          `Only one member can hold "${entry.role}" for now`
        );
      }

      seenRoles.add(entry.role);
    }

    const memberIds = [...new Set(entries.map(entry => entry.memberId))];
    const malformed = memberIds.some(memberId => !isValidObjectId(memberId));
    const members = malformed
      ? []
      : await memberRepository.listByIds(memberIds);

    if (malformed || members.length !== memberIds.length) {
      throw new ApiError(
        404,
        ErrorCodes.MEMBER_NOT_FOUND,
        'One of the chosen members is no longer on the team list'
      );
    }

    await assignmentRepository.replaceForService(id, entries);

    return buildRoles(service);
  },

  /**
   * Creates the next Saturdays and Sundays in one go, so an admin can fill in
   * two months in a single tap. Days that already have a service of that type
   * are left untouched, which makes the action safe to repeat.
   */
  async generateWeeks(
    weeks: number
  ): Promise<{created: ServiceDocument[]; skipped: number}> {
    const todayKey = manilaDateKey(new Date());
    const todayWeekday = getWeekday(todayKey);

    // 0 means today already is that day, so today's service is included.
    const daysToSaturday = (6 - todayWeekday + 7) % 7;
    const daysToSunday = (0 - todayWeekday + 7) % 7;

    const wanted: {type: ServiceType; dateKey: string}[] = [];

    for (let week = 0; week < weeks; week += 1) {
      wanted.push({
        type: 'saturday',
        dateKey: addDays(todayKey, daysToSaturday + week * 7)
      });
      wanted.push({
        type: 'sunday',
        dateKey: addDays(todayKey, daysToSunday + week * 7)
      });
    }

    // The Saturdays and Sundays of a week can fall in either order, so the
    // edge of the range has to be found, not assumed.
    const firstKey = wanted.reduce(
      (earliest, item) => (item.dateKey < earliest ? item.dateKey : earliest),
      todayKey
    );
    const lastKey = wanted.reduce(
      (latest, item) => (item.dateKey > latest ? item.dateKey : latest),
      todayKey
    );

    const existing = await serviceRepository.listBetween(
      manilaInstant(firstKey),
      manilaInstant(addDays(lastKey, 1))
    );

    const takenKeys = new Set(
      existing.map(service => `${service.type}:${manilaDateKey(service.date)}`)
    );

    const created: ServiceDocument[] = [];

    for (const item of wanted) {
      if (takenKeys.has(`${item.type}:${item.dateKey}`)) continue;

      // Two services of the same type can never share a day.
      takenKeys.add(`${item.type}:${item.dateKey}`);

      created.push(
        await serviceRepository.create({
          type: item.type,
          date: manilaInstant(
            item.dateKey,
            DEFAULT_SERVICE_TIMES[item.type]
          ),
          time: DEFAULT_SERVICE_TIMES[item.type]
        })
      );
    }

    return {created, skipped: wanted.length - created.length};
  }
};
