"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeService = void 0;
const env_1 = require("../config/env");
const error_1 = require("../utils/error");
function decodeHtmlEntities(value) {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'");
}
exports.youtubeService = {
    async searchVideos(query) {
        if (!env_1.env.YOUTUBE_API_KEY) {
            throw new error_1.ApiError(503, 'YOUTUBE_NOT_CONFIGURED', 'YouTube search is not configured.');
        }
        const url = new URL('https://www.googleapis.com/youtube/v3/search');
        url.searchParams.set('part', 'snippet');
        url.searchParams.set('q', query);
        url.searchParams.set('type', 'video');
        url.searchParams.set('maxResults', '10');
        url.searchParams.set('key', env_1.env.YOUTUBE_API_KEY);
        let response;
        try {
            response = await fetch(url.toString());
        }
        catch {
            throw new error_1.ApiError(502, 'YOUTUBE_SEARCH_FAILED', 'YouTube search failed. Please try again.');
        }
        if (!response.ok) {
            throw new error_1.ApiError(502, 'YOUTUBE_SEARCH_FAILED', 'YouTube search failed. Please try again.');
        }
        const data = (await response.json());
        const items = data.items ?? [];
        return items
            .map(item => {
            const videoId = item.id?.videoId;
            if (!videoId)
                return null;
            const snippet = item.snippet;
            const thumbnailUrl = snippet?.thumbnails?.medium?.url ??
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
            .filter((video) => video !== null);
    },
    async getVideo(videoId) {
        if (!env_1.env.YOUTUBE_API_KEY) {
            throw new error_1.ApiError(503, 'YOUTUBE_NOT_CONFIGURED', 'YouTube search is not configured.');
        }
        const url = new URL('https://www.googleapis.com/youtube/v3/videos');
        url.searchParams.set('part', 'snippet,contentDetails');
        url.searchParams.set('id', videoId);
        url.searchParams.set('key', env_1.env.YOUTUBE_API_KEY);
        let response;
        try {
            response = await fetch(url.toString());
        }
        catch {
            throw new error_1.ApiError(502, 'YOUTUBE_SEARCH_FAILED', 'YouTube search failed. Please try again.');
        }
        if (!response.ok) {
            throw new error_1.ApiError(502, 'YOUTUBE_SEARCH_FAILED', 'YouTube search failed. Please try again.');
        }
        const data = (await response.json());
        const item = (data.items ?? [])[0];
        if (!item || !item.id) {
            throw new error_1.ApiError(404, 'VIDEO_NOT_FOUND', 'We could not find this video.');
        }
        const snippet = item.snippet;
        const thumbnailUrl = snippet?.thumbnails?.high?.url ??
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
