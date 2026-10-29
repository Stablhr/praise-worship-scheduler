import {httpClient} from './httpClient';

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

export async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  const res = await httpClient.get<{results: YouTubeVideo[]}>(
    `/youtube/search?q=${encodeURIComponent(query)}`
  );
  return res.data.results;
}

export async function getYouTubeVideo(
  videoId: string
): Promise<YouTubeVideoDetails> {
  const res = await httpClient.get<{video: YouTubeVideoDetails}>(
    `/youtube/video?id=${encodeURIComponent(videoId)}`
  );
  return res.data.video;
}

/** Extracts a YouTube video id from a watch or youtu.be URL, or null. */
export function extractYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}