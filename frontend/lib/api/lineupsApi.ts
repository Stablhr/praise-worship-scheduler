import {httpClient} from './httpClient';

export type SongType = 'praise' | 'worship';

/** One song as the app receives it. Matches SongDto on the server. */
export type Song = {
  id: string;
  title: string;
  link?: string;
  type: SongType;
  order: number;
};

/** A lineup as the app receives it. Matches LineupDto on the server. */
export type Lineup = {
  serviceId: string;
  songs: Song[];
};

export type SongInput = {
  title: string;
  link?: string;
  type: SongType;
};

export type SongChanges = Partial<SongInput>;

/** Returns the lineup for one service (creates an empty one on the server if needed). */
export async function getLineup(serviceId: string): Promise<Lineup> {
  const res = await httpClient.get<{lineup: Lineup}>(
    `/services/${serviceId}/lineup`
  );
  return res.data.lineup;
}

export async function addSong(
  serviceId: string,
  input: SongInput
): Promise<Lineup> {
  const res = await httpClient.post<{lineup: Lineup}>(
    `/services/${serviceId}/lineup/songs`,
    input
  );
  return res.data.lineup;
}

export async function updateSong(
  serviceId: string,
  songId: string,
  changes: SongChanges
): Promise<Lineup> {
  const res = await httpClient.patch<{lineup: Lineup}>(
    `/services/${serviceId}/lineup/songs/${songId}`,
    changes
  );
  return res.data.lineup;
}

export async function deleteSong(
  serviceId: string,
  songId: string
): Promise<Lineup> {
  const res = await httpClient.delete<{lineup: Lineup}>(
    `/services/${serviceId}/lineup/songs/${songId}`
  );
  return res.data.lineup;
}

export async function reorderSongs(
  serviceId: string,
  songIds: string[]
): Promise<Lineup> {
  const res = await httpClient.put<{lineup: Lineup}>(
    `/services/${serviceId}/lineup/songs/order`,
    {songIds}
  );
  return res.data.lineup;
}