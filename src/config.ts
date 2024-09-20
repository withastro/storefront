export const MAX_QUANTITY = 20;
export const ONE_DAY = 60 * 60 * 24;

const DEFAULT_CACHE_HEADERS = [
	['cache-control', 'public,max-age=0,must-revalidate'],
	// 5 second cache, allow up to 30 minutes until next request to revalidate.
	['cdn-cache-control', `public,durable,s-maxage=${5},stale-while-revalidate=${60 * 30}`],
] as const;

export function applyDefaultCacheHeaders(headers: Headers) {
	for (const [key, value] of DEFAULT_CACHE_HEADERS) {
		headers.append(key, value);
	}
}
