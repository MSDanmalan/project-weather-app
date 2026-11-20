const ALLOWED_ORIGINS = new Set([
  'https://msdanmalan.github.io',
  'http://localhost:8080',
]);

const WEATHER_API_URL = 'https://api.weatherapi.com/v1/current.json';
const UPSTREAM_TIMEOUT_MS = 5_000;
const CACHE_TTL_SECONDS = 60;
const MAX_CITY_LENGTH = 100;

function jsonResponse(data, status, origin, { cache = false } = {}) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': cache ? `public, max-age=${CACHE_TTL_SECONDS}` : 'no-store',
    Vary: 'Origin',
  });

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return new Response(JSON.stringify(data), { status, headers });
}

function errorResponse(code, message, status, origin, extraHeaders = {}) {
  const response = jsonResponse({ error: { code, message } }, status, origin);
  for (const [name, value] of Object.entries(extraHeaders)) {
    response.headers.set(name, value);
  }
  return response;
}

function normalizeCity(value) {
  if (typeof value !== 'string') return null;

  const city = value.trim().replace(/\s+/gu, ' ');
  if (
    city.length === 0
    || [...city].length > MAX_CITY_LENGTH
    || /[\u0000-\u001F\u007F]/u.test(city)
    || !/^[\p{L}\p{M}\p{N} .,'’()&-]+$/u.test(city)
  ) {
    return null;
  }

  return city;
}

function extractWeatherFields(payload) {
  const location = payload?.location;
  const current = payload?.current;
  if (
    typeof location?.name !== 'string'
    || typeof location?.country !== 'string'
    || !Number.isFinite(current?.temp_c)
    || !Number.isFinite(current?.feelslike_c)
    || !Number.isFinite(current?.humidity)
    || !Number.isFinite(current?.wind_kph)
  ) {
    return null;
  }

  return {
    name: location.name,
    country: location.country,
    temp_c: current.temp_c,
    feelslike_c: current.feelslike_c,
    humidity: current.humidity,
    wind_kph: current.wind_kph,
  };
}

function makeCacheKey(requestUrl, city) {
  const cacheUrl = new URL('/__weather_cache', requestUrl);
  cacheUrl.searchParams.set('city', city.toLocaleLowerCase('en-US'));
  return new Request(cacheUrl.toString(), { method: 'GET' });
}

function getCache() {
  try {
    return globalThis.caches?.default ?? null;
  } catch {
    return null;
  }
}

function withPreflightHeaders(origin) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept',
    'Access-Control-Max-Age': '600',
    'Content-Length': '0',
    Vary: 'Origin',
  });
  return new Response(null, { status: 204, headers });
}

async function handleWeather(request, env, ctx, origin, url) {
  const cityValues = url.searchParams.getAll('city');
  if (cityValues.length !== 1 || [...url.searchParams.keys()].length !== 1) {
    return errorResponse('invalid_city', 'Provide one valid city.', 400, origin);
  }

  const city = normalizeCity(cityValues[0]);
  if (!city) {
    return errorResponse('invalid_city', 'Provide one valid city.', 400, origin);
  }

  if (typeof env.WEATHER_API_KEY !== 'string' || env.WEATHER_API_KEY.length === 0) {
    return errorResponse('service_unavailable', 'Weather service is unavailable.', 503, origin);
  }

  const cache = getCache();
  const cacheKey = makeCacheKey(url, city);
  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const data = await cached.json();
        if (extractWeatherFields({ location: { name: data.name, country: data.country }, current: data })) {
          return jsonResponse(data, 200, origin, { cache: true });
        }
      }
    } catch {
      // Cache failures are treated as misses; they never expose upstream details.
    }
  }

  const upstreamUrl = new URL(WEATHER_API_URL);
  upstreamUrl.searchParams.set('key', env.WEATHER_API_KEY);
  upstreamUrl.searchParams.set('q', city);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  let payload;
  try {
    const upstream = await fetch(upstreamUrl, { signal: controller.signal });
    if (!upstream.ok) {
      return errorResponse('upstream_failure', 'Unable to retrieve weather right now.', 502, origin);
    }
    payload = await upstream.json();
  } catch {
    if (controller.signal.aborted) {
      return errorResponse('upstream_timeout', 'Weather provider timed out.', 504, origin);
    }
    return errorResponse('upstream_failure', 'Unable to retrieve weather right now.', 502, origin);
  } finally {
    clearTimeout(timeout);
  }

  const weather = extractWeatherFields(payload);
  if (!weather) {
    return errorResponse('upstream_failure', 'Unable to retrieve weather right now.', 502, origin);
  }

  if (cache) {
    const cacheResponse = jsonResponse(weather, 200, null, { cache: true });
    try {
      const cacheWrite = Promise.resolve()
        .then(() => cache.put(cacheKey, cacheResponse))
        .catch(() => {});
      ctx.waitUntil(cacheWrite);
    } catch {
      // A cache write failure does not fail an otherwise successful weather request.
    }
  }

  return jsonResponse(weather, 200, origin, { cache: true });
}

async function enforceRateLimit(request, env, origin) {
  const clientIp = request.headers.get('CF-Connecting-IP');
  if (!clientIp || !env.WEATHER_RATE_LIMITER) {
    return errorResponse('service_unavailable', 'Weather service is unavailable.', 503, origin);
  }

  try {
    const rateLimit = await env.WEATHER_RATE_LIMITER.limit({ key: clientIp });
    if (!rateLimit?.success) {
      return errorResponse('rate_limited', 'Too many requests. Try again shortly.', 429, origin, {
        'Retry-After': '60',
      });
    }
  } catch {
    return errorResponse('service_unavailable', 'Weather service is unavailable.', 503, origin);
  }

  return null;
}

export default {
  async fetch(request, env, ctx) {
    let origin = null;
    try {
      const url = new URL(request.url);
      origin = request.headers.get('Origin');

      // Count every request to the endpoint, including preflight requests and
      // requests rejected by origin, method, or query validation.
      if (url.pathname === '/api/weather') {
        const rateLimitResponse = await enforceRateLimit(request, env, origin);
        if (rateLimitResponse) return rateLimitResponse;
      }

      if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return errorResponse('origin_not_allowed', 'Origin is not allowed.', 403, null);
      }

      if (request.method === 'OPTIONS') {
        if (!origin) {
          return errorResponse('origin_required', 'An allowed origin is required.', 403, null);
        }

        const requestedMethod = request.headers.get('Access-Control-Request-Method');
        const requestedHeaders = request.headers.get('Access-Control-Request-Headers');
        const requestedHeaderNames = requestedHeaders
          ?.split(',')
          .map((header) => header.trim().toLowerCase())
          .filter(Boolean);
        if (
          requestedMethod?.toUpperCase() !== 'GET'
          || (requestedHeaders && (
            requestedHeaderNames.length === 0
            || requestedHeaderNames.some((header) => header !== 'accept')
          ))
        ) {
          return errorResponse('preflight_not_allowed', 'Preflight request is not allowed.', 403, null);
        }

        if (url.pathname !== '/api/weather') {
          return errorResponse('not_found', 'Endpoint not found.', 404, origin);
        }
        return withPreflightHeaders(origin);
      }

      if (url.pathname !== '/api/weather') {
        return errorResponse('not_found', 'Endpoint not found.', 404, origin);
      }

      if (request.method !== 'GET') {
        return errorResponse('method_not_allowed', 'Method not allowed.', 405, origin, {
          Allow: 'GET, OPTIONS',
        });
      }

      return await handleWeather(request, env, ctx, origin, url);
    } catch {
      return errorResponse('internal_error', 'Weather service is unavailable.', 500, origin);
    }
  },
};
