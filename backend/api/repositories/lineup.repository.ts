import mongoose, {isValidObjectId, UpdateQuery} from 'mongoose';
import {LineupDocument, LineupModel} from '../models/Lineup.model';

export const lineupRepository = {
  /** Returns null for a malformed id or a missing lineup. */
  findByService: (serviceId: string) =>
    isValidObjectId(serviceId)
      ? LineupModel.findOne({serviceId}).exec()
      : Promise.resolve(null),

  /** Creates an empty lineup for a service. */
  createForService: (serviceId: string) =>
    LineupModel.create({serviceId, songs: []}),

  /**
   * Returns an existing lineup or creates an empty one, so callers never have
   * to handle "no lineup yet".
   */
  findOrCreate: async (serviceId: string): Promise<LineupDocument> => {
    const existing = await lineupRepository.findByService(serviceId);

    if (existing) return existing;

    return lineupRepository.createForService(serviceId);
  },

  /**
   * Adds a song and returns the updated lineup. The song is appended at the end.
   */
  addSong: async (
    serviceId: string,
    song: {title: string; link?: string; type: 'praise' | 'worship'; addedBy?: string}
  ): Promise<LineupDocument> => {
    const lineup = await lineupRepository.findOrCreate(serviceId);
    const order = lineup.songs.length;

    lineup.songs.push({
      _id: new mongoose.Types.ObjectId(),
      title: song.title,
      link: song.link,
      type: song.type,
      order,
      addedBy: song.addedBy
        ? new mongoose.Types.ObjectId(song.addedBy)
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    } as never);

    await lineup.save();
    return lineup;
  },

  /** Updates one song's title, link or type. */
  updateSong: async (
    serviceId: string,
    songId: string,
    changes: {title?: string; link?: string; type?: 'praise' | 'worship'}
  ): Promise<LineupDocument | null> => {
    const lineup = await lineupRepository.findByService(serviceId);

    if (!lineup) return null;

    const song = (lineup.songs as any).id(songId);

    if (!song) return null;

    if (changes.title !== undefined) song.title = changes.title;
    if (changes.link !== undefined) song.link = changes.link || undefined;
    if (changes.type !== undefined) song.type = changes.type;

    await lineup.save();
    return lineup;
  },

  /** Removes one song. */
  deleteSong: async (
    serviceId: string,
    songId: string
  ): Promise<LineupDocument | null> => {
    const lineup = await lineupRepository.findByService(serviceId);

    if (!lineup) return null;

    const song = (lineup.songs as any).id(songId);

    if (!song) return null;

    song.deleteOne();
    await lineup.save();
    return lineup;
  },

  /** Reorders songs to match the given id list. */
  reorderSongs: async (
    serviceId: string,
    songIds: string[]
  ): Promise<LineupDocument | null> => {
    const lineup = await lineupRepository.findByService(serviceId);

    if (!lineup) return null;

    const byId = new Map(lineup.songs.map(song => [song._id.toString(), song]));
    const reordered: typeof lineup.songs = [];

    for (const id of songIds) {
      const song = byId.get(id);

      if (song) reordered.push(song);
    }

    // Append any songs that were not mentioned, so nothing is lost.
    for (const song of lineup.songs) {
      if (!songIds.includes(song._id.toString())) reordered.push(song);
    }

    reordered.forEach((song, index) => {
      song.order = index;
    });

    lineup.songs = reordered;
    await lineup.save();
    return lineup;
  }
};