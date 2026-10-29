import {httpClient} from './httpClient';

export type YouTubeVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  url: string;
};

export async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  const res = await httpClient.get<{results: YouTubeVideo[]}>(
    `/youtube/search?q=${encodeURIComponent(query)}`
  );
  return res.data.results;
}