import {env} from '../config/env';
import {ApiError} from '../utils/error';

export type YouTubeVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  url: string;
};

export type YouTubeVideoDetails = {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt: string;
  url: string;
};

type YouTubeSearchResponse = {
  items?: Array<{
    id?: {videoId?: string};
    snippet?: {
      title?: string;
      channelTitle?: string;
      thumbnails?: {
        medium?: {url?: string};
        default?: {url?: string};
        high?: {url?: string};
      };
    };
  }>;
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

export const youtubeService = {
  async searchVideos(query: string): Promise<YouTubeVideo[]> {
    if (!env.YOUTUBE_API_KEY) {
      throw new ApiError(
        503,
        'YOUTUBE_NOT_CONFIGURED',
        'YouTube search is not configured.'
      );
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '10');
    url.searchParams.set('key', env.YOUTUBE_API_KEY);

    let response: Response;
    try {
      response = await fetch(url.toString());
    } catch {
      throw new ApiError(
        502,
        'YOUTUBE_SEARCH_FAILED',
        'YouTube search failed. Please try again.'
      );
    }

    if (!response.ok) {
      throw new ApiError(
        502,
        'YOUTUBE_SEARCH_FAILED',
        'YouTube search failed. Please try again.'
      );
    }

    const data = (await response.json()) as YouTubeSearchResponse;
    const items = data.items ?? [];

    return items
      .map(item => {
        const videoId = item.id?.videoId;
        if (!videoId) return null;
        const snippet = item.snippet;
        const thumbnailUrl =
          snippet?.thumbnails?.medium?.url ??
          snippet?.thumbnails?.high?.url ??
          snippet?.thumbnails?.default?.url ??
          '';
        return {
          videoId,
          title: decodeHtmlEntities(snippet?.title ?? ''),
          channelTitle: decodeHtmlEntities(snippet?.channelTitle ?? ''),
          thumbnailUrl,
          url: `https://www.youtube.com/watch?v=${videoId}`
        };
      })
      .filter((video): video is YouTubeVideo => video !== null);
  },

  async getVideo(videoId: string): Promise<YouTubeVideoDetails> {
    if (!env.YOUTUBE_API_KEY) {
      throw new ApiError(
        503,
        'YOUTUBE_NOT_CONFIGURED',
        'YouTube search is not configured.'
      );
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('id', videoId);
    url.searchParams.set('key', env.YOUTUBE_API_KEY);

    let response: Response;
    try {
      response = await fetch(url.toString());
    } catch {
      throw new ApiError(
        502,
        'YOUTUBE_SEARCH_FAILED',
        'YouTube search failed. Please try again.'
      );
    }

    if (!response.ok) {
      throw new ApiError(
        502,
        'YOUTUBE_SEARCH_FAILED',
        'YouTube search failed. Please try again.'
      );
    }

    const data = (await response.json()) as {
      items?: Array<{
        id?: string;
        snippet?: {
          title?: string;
          channelTitle?: string;
          description?: string;
          publishedAt?: string;
          thumbnails?: {
            high?: {url?: string};
            medium?: {url?: string};
            default?: {url?: string};
          };
        };
        contentDetails?: {duration?: string};
      }>;
    };

    const item = (data.items ?? [])[0];
    if (!item || !item.id) {
      throw new ApiError(404, 'VIDEO_NOT_FOUND', 'We could not find this video.');
    }

    const snippet = item.snippet;
    const thumbnailUrl =
      snippet?.thumbnails?.high?.url ??
      snippet?.thumbnails?.medium?.url ??
      snippet?.thumbnails?.default?.url ??
      '';

    return {
      videoId: item.id,
      title: decodeHtmlEntities(snippet?.title ?? ''),
      channelTitle: decodeHtmlEntities(snippet?.channelTitle ?? ''),
      description: snippet?.description ?? '',
      thumbnailUrl,
      duration: item.contentDetails?.duration ?? '',
      publishedAt: snippet?.publishedAt ?? '',
      url: `https://www.youtube.com/watch?v=${item.id}`
    };
  }
};