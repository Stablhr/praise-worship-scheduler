import {ApiError} from '../utils/error';
import {ErrorCodes} from '../constants/errorCodes';
import {LineupDocument} from '../models/Lineup.model';
import {LineupModel} from '../models/Lineup.model';
import {serviceRepository} from '../repositories/service.repository';
import {lineupRepository} from '../repositories/lineup.repository';
import {notificationService} from './notification.service';
import type {AddSongDto, UpdateSongDto} from '../dtos/lineup.dto';

/** One song as the app receives it. */
export type SongDto = {
  id: string;
  title: string;
  link?: string;
  type: 'praise' | 'worship';
  order: number;
};

/** A lineup as the app receives it. */
export type LineupDto = {
  serviceId: string;
  songs: SongDto[];
};

export function toSongDto(song: {
  _id: {toString: () => string};
  title: string;
  link?: string;
  type: 'praise' | 'worship';
  order: number;
}): SongDto {
  return {
    id: song._id.toString(),
    title: song.title,
    link: song.link,
    type: song.type,
    order: song.order
  };
}

export function toLineupDto(lineup: LineupDocument): LineupDto {
  const sorted = [...lineup.songs].sort((a, b) => a.order - b.order);

  return {
    serviceId: lineup.serviceId.toString(),
    songs: sorted.map(toSongDto)
  };
}

async function requireService(serviceId: string) {
  const service = await serviceRepository.findById(serviceId);

  if (!service) {
    throw new ApiError(
      404,
      ErrorCodes.SERVICE_NOT_FOUND,
      'We could not find this service'
    );
  }

  return service;
}

async function requireLineup(serviceId: string) {
  const lineup = await lineupRepository.findByService(serviceId);

  if (!lineup) {
    throw new ApiError(
      404,
      ErrorCodes.LINEUP_NOT_FOUND,
      'We could not find a lineup for this service'
    );
  }

  return lineup;
}

export const lineupService = {
  /** Returns the lineup for one service, creating an empty one if needed. */
  async get(serviceId: string): Promise<LineupDto> {
    await requireService(serviceId);

    const lineup = await lineupRepository.findOrCreate(serviceId);

    return toLineupDto(lineup);
  },

  /** Adds a song and returns the updated lineup. */
  async addSong(
    serviceId: string,
    input: AddSongDto,
    addedBy?: string
  ): Promise<LineupDto> {
    await requireService(serviceId);

    const lineup = await lineupRepository.addSong(serviceId, {
      title: input.title,
      link: input.link || undefined,
      type: input.type,
      addedBy
    });

    // Notify all members that the lineup changed.
    void notificationService.notifyLineupChanged(serviceId);

    return toLineupDto(lineup);
  },

  /** Updates a song and returns the updated lineup. */
  async updateSong(
    serviceId: string,
    songId: string,
    input: UpdateSongDto
  ): Promise<LineupDto> {
    await requireService(serviceId);

    const lineup = await lineupRepository.updateSong(serviceId, songId, {
      title: input.title,
      link: input.link,
      type: input.type
    });

    if (!lineup) {
      throw new ApiError(
        404,
        ErrorCodes.SONG_NOT_FOUND,
        'We could not find this song'
      );
    }

    void notificationService.notifyLineupChanged(serviceId);

    return toLineupDto(lineup);
  },

  /** Removes a song and returns the updated lineup. */
  async deleteSong(serviceId: string, songId: string): Promise<LineupDto> {
    await requireService(serviceId);

    const lineup = await lineupRepository.deleteSong(serviceId, songId);

    if (!lineup) {
      throw new ApiError(
        404,
        ErrorCodes.SONG_NOT_FOUND,
        'We could not find this song'
      );
    }

    void notificationService.notifyLineupChanged(serviceId);

    return toLineupDto(lineup);
  },

  /** Reorders songs and returns the updated lineup. */
  async reorderSongs(
    serviceId: string,
    songIds: string[]
  ): Promise<LineupDto> {
    await requireService(serviceId);

    const lineup = await lineupRepository.reorderSongs(serviceId, songIds);

    if (!lineup) {
      throw new ApiError(
        404,
        ErrorCodes.LINEUP_NOT_FOUND,
        'We could not find a lineup for this service'
      );
    }

    void notificationService.notifyLineupChanged(serviceId);

    return toLineupDto(lineup);
  }
};