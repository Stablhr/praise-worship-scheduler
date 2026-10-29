'use client';

import {useEffect, useMemo, useState} from 'react';
import {useQueries, useQueryClient} from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ListMusic,
  Music,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import {BottomSheet} from '@/components/app/BottomSheet';
import {ConfirmDialog} from '@/components/app/ConfirmDialog';
import {EmptyState} from '@/components/app/EmptyState';
import {ErrorState} from '@/components/app/ErrorState';
import {PillButton} from '@/components/app/PillButton';
import {ScreenHeader} from '@/components/app/ScreenHeader';
import {Skeleton} from '@/components/ui/skeleton';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import {isSongLeader} from '@/lib/auth/permissions';
import {searchYouTube} from '@/lib/api/youtubeApi';
import type {YouTubeVideo} from '@/lib/api/youtubeApi';
import type {Song, SongChanges, SongType} from '@/lib/api/lineupsApi';
import {deleteSong, getLineup} from '@/lib/api/lineupsApi';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';
import {useServicesQuery} from '@/lib/hooks/schedule/useServicesQuery';
import {formatDayLabel} from '@/lib/date/manila';
import {SERVICE_TYPE_LABELS} from '@/lib/schedule/services';
import {getManilaTodayKey} from '@/lib/date/manila';
import {
  useAddSong,
  useUpdateSong
} from '@/lib/hooks/lineups/useLineupMutations';
import {lineupQueryKey} from '@/lib/hooks/lineups/useLineupQuery';

type Tab = 'weekend' | 'all';

function getWeekendRange(): {from: string; to: string} {
  const today = getManilaTodayKey();
  const future = new Date();
  future.setDate(future.getDate() + 7);
  return {from: today, to: future.toISOString().slice(0, 10)};
}

function getAllRange(): {from: string; to: string} {
  const now = new Date();
  const past = new Date(now);
  past.setDate(past.getDate() - 90);
  const future = new Date(now);
  future.setDate(future.getDate() + 90);
  return {
    from: past.toISOString().slice(0, 10),
    to: future.toISOString().slice(0, 10)
  };
}

export default function LineupsPage() {
  const {data: me} = useMeQuery();
  const canEdit = isSongLeader(me?.user);
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('weekend');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [editingSong, setEditingSong] = useState<{
    serviceId: string;
    song: Song;
  } | null>(null);
  const [removingSong, setRemovingSong] = useState<{
    serviceId: string;
    songId: string;
    title: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const range = tab === 'weekend' ? getWeekendRange() : getAllRange();

  const {
    data: services,
    isPending,
    isError,
    error,
    refetch
  } = useServicesQuery(range.from, range.to);

  const serviceList = useMemo(() => services ?? [], [services]);

  const lineupQueries = useQueries({
    queries: serviceList.map(service => ({
      queryKey: lineupQueryKey(service.id),
      queryFn: () => getLineup(service.id),
      staleTime: 15_000
    }))
  });

  const lineupByService = useMemo(() => {
    const map = new Map<string, {songs: Song[]}>();
    serviceList.forEach((service, index) => {
      const q = lineupQueries[index];
      if (q?.data) {
        map.set(service.id, q.data);
      }
    });
    return map;
  }, [serviceList, lineupQueries]);

  function toggleExpanded(serviceId: string) {
    setExpanded(previous => {
      const next = new Set(previous);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  }

  async function handleRemoveSong() {
    if (!removingSong) return;
    setIsRemoving(true);
    try {
      await deleteSong(removingSong.serviceId, removingSong.songId);
      void queryClient.invalidateQueries({
        queryKey: lineupQueryKey(removingSong.serviceId)
      });
      setRemovingSong(null);
    } catch {
      // Keep dialog open on error.
    } finally {
      setIsRemoving(false);
    }
  }

  if (isPending) return <LineupsSkeleton />;

  if (isError) {
    return (
      <>
        <ScreenHeader title="Lineups" />
        <div className="mx-auto w-full max-w-[480px] px-4 py-6">
          <ErrorState
            message={getFriendlyErrorMessage(
              error,
              'We could not load the lineups. Please try again.'
            )}
            onRetry={() => refetch()}
          />
        </div>
      </>
    );
  }

  const visibleServices = serviceList.filter(s => {
    if (tab === 'weekend') {
      return s.type === 'saturday' || s.type === 'sunday';
    }
    return true;
  });

  return (
    <>
      <ScreenHeader title="Lineups" />

      <div className="mx-auto w-full max-w-[480px] px-4 py-4">
        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('weekend')}
            className={`flex-1 rounded-pill px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ease-out ${
              tab === 'weekend'
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface text-muted border border-border'
            }`}
          >
            This Weekend
          </button>
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`flex-1 rounded-pill px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ease-out ${
              tab === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface text-muted border border-border'
            }`}
          >
            All Lineups
          </button>
        </div>

        {visibleServices.length === 0 ? (
          <EmptyState
            icon={ListMusic}
            title="No lineups yet"
            description={
              tab === 'weekend'
                ? 'Saturday and Sunday services for this week will appear here.'
                : 'Services with songs will appear here.'
            }
          />
        ) : (
          <div className="space-y-3">
            {visibleServices.map(service => {
              const lineup = lineupByService.get(service.id);
              const songs = lineup?.songs ?? [];
              const isExpanded = expanded.has(service.id);

              return (
                <ServiceLineupCard
                  key={service.id}
                  service={service}
                  songs={songs}
                  isExpanded={isExpanded}
                  canEdit={canEdit}
                  isEditing={editingServiceId === service.id}
                  onToggle={() => toggleExpanded(service.id)}
                  onEdit={() => setEditingServiceId(service.id)}
                  onDoneEditing={() => setEditingServiceId(null)}
                  onAddSong={() => setAddingTo(service.id)}
                  onEditSong={(song) =>
                    setEditingSong({serviceId: service.id, song})
                  }
                  onRemoveSong={(songId, title) =>
                    setRemovingSong({serviceId: service.id, songId, title})
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add song sheet */}
      {addingTo && (
        <AddSongSheet
          open
          onOpenChange={open => {
            if (!open) setAddingTo(null);
          }}
          serviceId={addingTo}
        />
      )}

      {/* Edit song sheet */}
      {editingSong && (
        <EditSongSheet
          open
          onOpenChange={open => {
            if (!open) setEditingSong(null);
          }}
          serviceId={editingSong.serviceId}
          song={editingSong.song}
        />
      )}

      {/* Remove song confirmation */}
      <ConfirmDialog
        open={removingSong !== null}
        onOpenChange={open => {
          if (!open) setRemovingSong(null);
        }}
        title="Remove this song?"
        description={
          removingSong
            ? `"${removingSong.title}" will be removed from the lineup.`
            : ''
        }
        confirmLabel="Remove"
        loadingLabel="Removing…"
        isDestructive
        isLoading={isRemoving}
        onConfirm={handleRemoveSong}
      />
    </>
  );
}

// ─── Service lineup card ──────────────────────────────────────────────

type ServiceLineupCardProps = {
  service: {id: string; type: 'saturday' | 'sunday'; date: string; time: string};
  songs: Song[];
  isExpanded: boolean;
  canEdit: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDoneEditing: () => void;
  onAddSong: () => void;
  onEditSong: (song: Song) => void;
  onRemoveSong: (songId: string, title: string) => void;
};

function ServiceLineupCard({
  service,
  songs,
  isExpanded,
  canEdit,
  isEditing,
  onToggle,
  onEdit,
  onDoneEditing,
  onAddSong,
  onEditSong,
  onRemoveSong
}: ServiceLineupCardProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ease-out active:bg-secondary"
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Music className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-text">
            {SERVICE_TYPE_LABELS[service.type]}
          </p>
          <p className="text-xs text-muted">
            {formatDayLabel(service.date)} · {songs.length}{' '}
            {songs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="size-5 text-muted" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-5 text-muted" aria-hidden="true" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border px-4 py-3">
          {songs.length === 0 ? (
            <p className="py-2 text-center text-sm text-muted">No songs yet.</p>
          ) : (
            <ul className="space-y-2">
              {songs.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={index}
                  canEdit={canEdit && isEditing}
                  onEdit={() => onEditSong(song)}
                  onRemove={() => onRemoveSong(song.id, song.title)}
                />
              ))}
            </ul>
          )}

          {canEdit && (
            <div className="mt-3 flex gap-2">
              {isEditing ? (
                <>
                  <PillButton
                    type="button"
                    variant="outline"
                    fullWidth={false}
                    onClick={onAddSong}
                    className="h-10 px-4 text-sm"
                  >
                    <Plus className="mr-1 size-4" aria-hidden="true" />
                    Add song
                  </PillButton>
                  <PillButton
                    type="button"
                    variant="outline"
                    fullWidth={false}
                    onClick={onDoneEditing}
                    className="h-10 px-4 text-sm"
                  >
                    Done
                  </PillButton>
                </>
              ) : (
                <PillButton
                  type="button"
                  variant="outline"
                  fullWidth={false}
                  onClick={onEdit}
                  className="h-10 px-4 text-sm"
                >
                  <Pencil className="mr-1 size-4" aria-hidden="true" />
                  Edit
                </PillButton>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Song row ─────────────────────────────────────────────────────────

type SongRowProps = {
  song: Song;
  index: number;
  canEdit: boolean;
  onEdit: () => void;
  onRemove: () => void;
};

function SongRow({song, index, canEdit, onEdit, onRemove}: SongRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-card bg-muted-surface/50 px-3 py-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">{song.title}</p>
        <span
          className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            song.type === 'praise'
              ? 'bg-praise-bg text-praise-text'
              : 'bg-worship-bg text-worship-text'
          }`}
        >
          {song.type === 'praise' ? 'Praise / Fast' : 'Worship / Slow'}
        </span>
      </div>
      {song.link && (
        <a
          href={song.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open link for ${song.title}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary transition-colors duration-150 ease-out active:bg-primary/10"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      )}
      {canEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${song.title}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors duration-150 ease-out active:bg-muted-surface"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </button>
      )}
      {canEdit && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${song.title}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-danger transition-colors duration-150 ease-out active:bg-danger/10"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

// ─── Add song sheet ───────────────────────────────────────────────────

type AddSongSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
};

function AddSongSheet({open, onOpenChange, serviceId}: AddSongSheetProps) {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState<SongType>('praise');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  const addSong = useAddSong(serviceId);

  // Debounced YouTube search.
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchYouTube(searchQuery.trim());
        if (!cancelled) setSearchResults(results);
      } catch (err) {
        if (!cancelled)
          setSearchError(
            getFriendlyErrorMessage(err, 'YouTube search failed. Please try again.')
          );
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  function handleSelectVideo(video: YouTubeVideo) {
    setSelectedVideo(video);
    setTitle(video.title);
    setLink(video.url);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  }

  function handleClearSelection() {
    setSelectedVideo(null);
    setTitle('');
    setLink('');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      await addSong.mutateAsync({
        title: title.trim(),
        link: link.trim() || undefined,
        type
      });
      setTitle('');
      setLink('');
      setType('praise');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedVideo(null);
      onOpenChange(false);
    } catch {
      // The button shows the error state.
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add a song"
      description="Search YouTube or enter the details manually."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* YouTube search */}
        <div>
          <label
            htmlFor="song-search"
            className="mb-1 block text-sm font-medium text-text"
          >
            Search YouTube
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="song-search"
              type="text"
              value={searchQuery}
              onChange={e => {
                const value = e.target.value;
                setSearchQuery(value);
                if (value.trim().length < 2) {
                  setSearchResults([]);
                  setSearchError(null);
                }
              }}
              placeholder="Search for a song..."
              className="h-12 w-full rounded-card border border-border bg-surface pl-10 pr-4 text-base text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {isSearching && (
              <Loader2
                className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted"
                aria-hidden="true"
              />
            )}
          </div>

          {searchError && (
            <p className="mt-1 text-sm text-danger">{searchError}</p>
          )}

          {searchResults.length > 0 && (
            <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-card border border-border bg-surface p-1">
              {searchResults.map(video => (
                <li key={video.videoId}>
                  <button
                    type="button"
                    onClick={() => handleSelectVideo(video)}
                    className="flex w-full items-center gap-3 rounded-card px-2 py-2 text-left transition-colors duration-150 ease-out active:bg-secondary"
                  >
                    {video.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={video.thumbnailUrl}
                        alt=""
                        className="h-12 w-20 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded bg-muted-surface text-muted">
                        <Music className="size-5" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">
                        {video.title}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {video.channelTitle}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedVideo && (
            <div className="mt-2 flex items-center gap-3 rounded-card border border-primary/30 bg-primary/5 px-3 py-2">
              {selectedVideo.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedVideo.thumbnailUrl}
                  alt=""
                  className="h-10 w-16 shrink-0 rounded object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">
                  {selectedVideo.title}
                </p>
                <p className="truncate text-xs text-muted">
                  {selectedVideo.channelTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearSelection}
                aria-label="Clear selected song"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors duration-150 ease-out active:bg-muted-surface"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="song-title"
            className="mb-1 block text-sm font-medium text-text"
          >
            Title
          </label>
          <input
            id="song-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Song title"
            className="h-12 w-full rounded-card border border-border bg-surface px-4 text-base text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>

        <div>
          <label
            htmlFor="song-link"
            className="mb-1 block text-sm font-medium text-text"
          >
            Link (optional)
          </label>
          <input
            id="song-link"
            type="url"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="https://youtube.com/..."
            className="h-12 w-full rounded-card border border-border bg-surface px-4 text-base text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text">Type</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('praise')}
              className={`flex-1 rounded-pill px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ease-out ${
                type === 'praise'
                  ? 'bg-praise-bg text-praise-text ring-2 ring-praise-text/30'
                  : 'bg-surface text-muted border border-border'
              }`}
            >
              Praise / Fast
            </button>
            <button
              type="button"
              onClick={() => setType('worship')}
              className={`flex-1 rounded-pill px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ease-out ${
                type === 'worship'
                  ? 'bg-worship-bg text-worship-text ring-2 ring-worship-text/30'
                  : 'bg-surface text-muted border border-border'
              }`}
            >
              Worship / Slow
            </button>
          </div>
        </div>

        <PillButton
          type="submit"
          isLoading={addSong.isPending}
          loadingLabel="Adding…"
        >
          Add song
        </PillButton>

        {addSong.isError && (
          <p className="text-sm text-danger">
            {getFriendlyErrorMessage(
              addSong.error,
              'We could not add the song. Please try again.'
            )}
          </p>
        )}
      </form>
    </BottomSheet>
  );
}

// ─── Edit song sheet ──────────────────────────────────────────────────

type EditSongSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  song: Song;
};

function EditSongSheet({open, onOpenChange, serviceId, song}: EditSongSheetProps) {
  const [title, setTitle] = useState(song.title);
  const [link, setLink] = useState(song.link ?? '');
  const [type, setType] = useState<SongType>(song.type);

  const updateSong = useUpdateSong(serviceId);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    const changes: SongChanges = {};
    if (title.trim() !== song.title) changes.title = title.trim();
    if ((link.trim() || undefined) !== song.link)
      changes.link = link.trim() || undefined;
    if (type !== song.type) changes.type = type;

    if (Object.keys(changes).length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      await updateSong.mutateAsync({songId: song.id, changes});
      onOpenChange(false);
    } catch {
      // The button shows the error state.
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit song"
      description="Update the song details."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="edit-song-title"
            className="mb-1 block text-sm font-medium text-text"
          >
            Title
          </label>
          <input
            id="edit-song-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Song title"
            className="h-12 w-full rounded-card border border-border bg-surface px-4 text-base text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>

        <div>
          <label
            htmlFor="edit-song-link"
            className="mb-1 block text-sm font-medium text-text"
          >
            Link (optional)
          </label>
          <input
            id="edit-song-link"
            type="url"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="https://youtube.com/..."
            className="h-12 w-full rounded-card border border-border bg-surface px-4 text-base text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text">Type</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('praise')}
              className={`flex-1 rounded-pill px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ease-out ${
                type === 'praise'
                  ? 'bg-praise-bg text-praise-text ring-2 ring-praise-text/30'
                  : 'bg-surface text-muted border border-border'
              }`}
            >
              Praise / Fast
            </button>
            <button
              type="button"
              onClick={() => setType('worship')}
              className={`flex-1 rounded-pill px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ease-out ${
                type === 'worship'
                  ? 'bg-worship-bg text-worship-text ring-2 ring-worship-text/30'
                  : 'bg-surface text-muted border border-border'
              }`}
            >
              Worship / Slow
            </button>
          </div>
        </div>

        <PillButton
          type="submit"
          isLoading={updateSong.isPending}
          loadingLabel="Saving…"
        >
          Save changes
        </PillButton>

        {updateSong.isError && (
          <p className="text-sm text-danger">
            {getFriendlyErrorMessage(
              updateSong.error,
              'We could not save the changes. Please try again.'
            )}
          </p>
        )}
      </form>
    </BottomSheet>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────

function LineupsSkeleton() {
  return (
    <>
      <ScreenHeader title="Lineups" />
      <div className="mx-auto w-full max-w-[480px] space-y-3 px-4 py-4">
        {[0, 1, 2].map(row => (
          <Skeleton key={row} className="h-[68px] w-full rounded-card" />
        ))}
      </div>
    </>
  );
}