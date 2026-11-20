import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import worker from '../worker/index.mjs';

const PROD_ORIGIN = 'https://msdanmalan.github.io';
const LOCAL_ORIGIN = 'http://localhost:8080';
const API_KEY = 'test-secret-never-return';
const BASE_URL = 'https://weather-worker.example.workers.dev';
const originalFetch = globalThis.fetch;
const originalCaches = Object.getOwnPropertyDescriptor(globalThis, 'caches');

const validPayload = {
  location: { name: 'St. John’s', country: 'Canada', extra: 'ignored' },
  current: {
    temp_c: 12.5,
    feelslike_c: 10.2,
    humidity: 71,
    wind_kph: 14.4,
    condition: { text: 'ignored' },
  },
  extra: 'ignored',
};

function makeRequest(path = '/api/weather?city=London', options = {}) {
  const headers = new Headers();
  if (options.ip !== null) headers.set('CF-Connecting-IP', options.ip ?? '203.0.113.42');
  if (options.origin !== null) headers.set('Origin', options.origin ?? PROD_ORIGIN);
  if (options.headers) {
    for (const [name, value] of Object.entries(options.headers)) headers.set(name, value);
  }
  return new Request(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
  });
}

function makeEnv(overrides = {}) {
  return {
    WEATHER_API_KEY: API_KEY,
    WEATHER_RATE_LIMITER: { limit: async () => ({ success: true }) },
    ...overrides,
  };
}

function makeContext() {
  const pending = [];
  return {
    pending,
    waitUntil(promise) {
      pending.push(Promise.resolve(promise));
    },
  };
}

function installCache() {
  const entries = new Map();
  const cache = {
    async match(request) {
      return entries.get(request.url)?.clone();
    },
    async put(request, response) {
      entries.set(request.url, response.clone());
    },
  };
  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    value: { default: cache },
  });
  return { entries, cache };
}

async function invoke(request, env = makeEnv(), ctx = makeContext()) {
  const response = await worker.fetch(request, env, ctx);
  await Promise.all(ctx.pending);
  return response;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalCaches) {
    Object.defineProperty(globalThis, 'caches', originalCaches);
  } else {
    delete globalThis.caches;
  }
});

test('normalizes a city, URL-encodes it, and returns only approved fields', async () => {
  installCache();
  let upstreamUrl;
  globalThis.fetch = async (url, options) => {
    upstreamUrl = new URL(url);
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json(validPayload);
  };

  const response = await invoke(makeRequest('/api/weather?city=%20St.%20John%E2%80%99s%20'));
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), PROD_ORIGIN);
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=60');
  assert.equal(upstreamUrl.searchParams.get('q'), 'St. John’s');
  assert.equal(upstreamUrl.searchParams.get('key'), API_KEY);
  assert.deepEqual(Object.keys(data), ['name', 'country', 'temp_c', 'feelslike_c', 'humidity', 'wind_kph']);
  assert.equal(data.name, 'St. John’s');
  assert.equal(JSON.stringify(data).includes(API_KEY), false);
  assert.equal('condition' in data, false);
});

test('collapses repeated whitespace before making the upstream request', async () => {
  globalThis.fetch = async (url) => {
    assert.equal(new URL(url).searchParams.get('q'), 'New York');
    return Response.json(validPayload);
  };
  const response = await invoke(makeRequest('/api/weather?city=New%20%20%20York'));
  assert.equal(response.status, 200);
});

test('rejects missing, repeated, malformed, and overlong city input', async (t) => {
  let upstreamCalls = 0;
  globalThis.fetch = async () => {
    upstreamCalls += 1;
    return Response.json(validPayload);
  };

  for (const path of [
    '/api/weather',
    '/api/weather?city=London&city=Paris',
    '/api/weather?city=London&other=value',
    '/api/weather?city=London%3Fq%3DParis',
    `/api/weather?city=${'a'.repeat(101)}`,
  ]) {
    await t.test(path.slice(0, 60), async () => {
      const response = await invoke(makeRequest(path));
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error.code, 'invalid_city');
    });
  }

  assert.equal(upstreamCalls, 0);
});

test('rejects unsupported paths and methods with safe responses', async () => {
  const pathResponse = await invoke(makeRequest('/other?city=London'));
  assert.equal(pathResponse.status, 404);
  assert.equal((await pathResponse.json()).error.code, 'not_found');

  const methodResponse = await invoke(makeRequest('/api/weather?city=London', { method: 'POST' }));
  assert.equal(methodResponse.status, 405);
  assert.equal(methodResponse.headers.get('Allow'), 'GET, OPTIONS');
  assert.equal((await methodResponse.json()).error.code, 'method_not_allowed');
});

test('handles allowed CORS preflight and rejects unapproved origins', async () => {
  const preflight = await invoke(makeRequest('/api/weather', {
    method: 'OPTIONS',
    origin: LOCAL_ORIGIN,
    headers: { 'Access-Control-Request-Method': 'GET' },
  }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), LOCAL_ORIGIN);
  assert.equal(preflight.headers.get('Access-Control-Allow-Methods'), 'GET, OPTIONS');

  const disallowed = await invoke(makeRequest('/api/weather?city=London', {
    origin: 'https://attacker.example',
  }));
  assert.equal(disallowed.status, 403);
  assert.equal(disallowed.headers.get('Access-Control-Allow-Origin'), null);
});

test('rejects unsupported preflight methods', async () => {
  const response = await invoke(makeRequest('/api/weather', {
    method: 'OPTIONS',
    headers: { 'Access-Control-Request-Method': 'POST' },
  }));
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, 'preflight_not_allowed');
});

test('rejects malformed preflight requests', async (t) => {
  for (const headers of [
    {},
    { 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'Accept, X-Secret' },
    { 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': ', ,' },
  ]) {
    await t.test(JSON.stringify(headers), async () => {
      const response = await invoke(makeRequest('/api/weather', { method: 'OPTIONS', headers }));
      assert.equal(response.status, 403);
      assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
    });
  }
});

test('returns a safe rate-limit response without contacting WeatherAPI', async () => {
  globalThis.fetch = async () => assert.fail('upstream should not be called');
  let key;
  const env = makeEnv({ WEATHER_RATE_LIMITER: { limit: async (argument) => {
    key = argument.key;
    return { success: false };
  } } });
  const response = await invoke(makeRequest(), env);

  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal(key, '203.0.113.42');
  assert.equal(JSON.stringify(await response.json()).includes(API_KEY), false);
});

test('returns 503 when client IP or rate-limit binding is unavailable', async (t) => {
  globalThis.fetch = async () => assert.fail('upstream should not be called');
  await t.test('missing client IP', async () => {
    const response = await invoke(makeRequest('/api/weather?city=London', { ip: null }));
    assert.equal(response.status, 503);
  });
  await t.test('missing binding', async () => {
    const response = await invoke(makeRequest(), makeEnv({ WEATHER_RATE_LIMITER: undefined }));
    assert.equal(response.status, 503);
  });
  await t.test('binding failure', async () => {
    const env = makeEnv({ WEATHER_RATE_LIMITER: { limit: async () => {
      throw new Error(`limiter failed with ${API_KEY}`);
    } } });
    const response = await invoke(makeRequest(), env);
    assert.equal(response.status, 503);
    assert.equal((await response.text()).includes(API_KEY), false);
  });
});

test('rate limits endpoint requests before invalid input, origin, and method rejection', async (t) => {
  globalThis.fetch = async () => assert.fail('rejected request should not reach upstream');
  const requests = [
    ['invalid city', makeRequest('/api/weather?city=%3Cbad%3E'), 400],
    ['disallowed origin', makeRequest('/api/weather?city=London', { origin: 'https://attacker.example' }), 403],
    ['unsupported method', makeRequest('/api/weather?city=London', { method: 'POST' }), 405],
    ['malformed preflight', makeRequest('/api/weather', { method: 'OPTIONS' }), 403],
  ];
  for (const [label, request, expectedStatus] of requests) {
    await t.test(label, async () => {
      let calls = 0;
      let key;
      const env = makeEnv({ WEATHER_RATE_LIMITER: { limit: async (argument) => {
        calls += 1;
        key = argument.key;
        return { success: true };
      } } });
      const response = await invoke(request, env);
      assert.equal(response.status, expectedStatus);
      assert.equal(calls, 1);
      assert.equal(key, '203.0.113.42');
    });
  }
});

test('returns generic errors for upstream HTTP and malformed JSON failures without caching', async (t) => {
  const { entries } = installCache();
  await t.test('upstream HTTP failure', async () => {
    globalThis.fetch = async () => new Response('secret upstream error', { status: 401 });
    const response = await invoke(makeRequest());
    assert.equal(response.status, 502);
    assert.equal((await response.text()).includes('secret upstream error'), false);
    assert.equal(entries.size, 0);
  });

  await t.test('malformed JSON', async () => {
    globalThis.fetch = async () => new Response('{', { status: 200 });
    const response = await invoke(makeRequest());
    assert.equal(response.status, 502);
    assert.equal(entries.size, 0);
  });

  await t.test('malformed weather fields', async () => {
    globalThis.fetch = async () => Response.json({ location: {}, current: {} });
    const response = await invoke(makeRequest());
    assert.equal(response.status, 502);
    assert.equal(entries.size, 0);
  });
});

test('maps WeatherAPI location-not-found errors to a safe 404', async () => {
  globalThis.fetch = async () => Response.json({
    error: { code: 1006, message: `No matching location. Sensitive detail: ${API_KEY}` },
  }, { status: 400 });

  const response = await invoke(makeRequest());
  const body = await response.text();
  assert.equal(response.status, 404);
  assert.deepEqual(JSON.parse(body), {
    error: {
      code: 'city_not_found',
      message: 'City not found. Please check the city name and try again.',
    },
  });
  assert.equal(body.includes(API_KEY), false);
  assert.equal(body.includes('No matching location'), false);
});

test('malformed and unreadable upstream error bodies fall back to generic 502', async (t) => {
  const cases = [
    ['malformed JSON', async () => new Response('{', { status: 400 })],
    ['missing provider code', async () => Response.json({ error: { message: 'No details exposed' } }, { status: 400 })],
    ['unreadable body', async () => ({
      ok: false,
      status: 400,
      json: async () => { throw new Error(`unreadable body ${API_KEY}`); },
    })],
  ];

  for (const [label, createResponse] of cases) {
    await t.test(label, async () => {
      globalThis.fetch = createResponse;
      const response = await invoke(makeRequest());
      const body = await response.text();
      assert.equal(response.status, 502);
      assert.deepEqual(JSON.parse(body), {
        error: {
          code: 'upstream_failure',
          message: 'Unable to retrieve weather right now.',
        },
      });
      assert.equal(body.includes(API_KEY), false);
      assert.equal(body.includes('No details exposed'), false);
    });
  }
});

test('keeps authentication and quota errors generic', async (t) => {
  for (const code of [1002, 2006, 2007]) {
    await t.test(`provider code ${code}`, async () => {
      globalThis.fetch = async () => Response.json({
        error: { code, message: `Provider detail with ${API_KEY}` },
      }, { status: 400 });
      const response = await invoke(makeRequest());
      const body = await response.text();
      assert.equal(response.status, 502);
      assert.match(body, /upstream_failure/u);
      assert.equal(body.includes(API_KEY), false);
      assert.equal(body.includes('Provider detail'), false);
    });
  }
});

test('preserves the timeout response while reading an upstream error body', async () => {
  globalThis.fetch = async (_url, { signal }) => ({
    ok: false,
    status: 400,
    json: () => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error(`body timeout ${API_KEY}`)), { once: true });
    }),
  });

  const response = await invoke(makeRequest());
  const body = await response.text();
  assert.equal(response.status, 504);
  assert.equal(body.includes(API_KEY), false);
  assert.equal(body.includes('body timeout'), false);
});

test('handles upstream timeouts without exposing details or caching', async () => {
  const { entries } = installCache();
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error(`timed out with key ${API_KEY}`)), { once: true });
  });

  const response = await invoke(makeRequest());
  assert.equal(response.status, 504);
  const body = await response.text();
  assert.equal(body.includes(API_KEY), false);
  assert.equal(body.includes('timed out with key'), false);
  assert.equal(entries.size, 0);
});

test('times out while reading the upstream response body', async () => {
  const { entries } = installCache();
  globalThis.fetch = async (_url, { signal }) => ({
    ok: true,
    json: () => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error(`body failed with ${API_KEY}`)), { once: true });
    }),
  });
  const response = await invoke(makeRequest());
  assert.equal(response.status, 504);
  assert.equal((await response.text()).includes(API_KEY), false);
  assert.equal(entries.size, 0);
});

test('returns cached successful weather without another upstream request', async () => {
  installCache();
  let upstreamCalls = 0;
  globalThis.fetch = async () => {
    upstreamCalls += 1;
    return Response.json(validPayload);
  };

  const first = await invoke(makeRequest('/api/weather?city=London'));
  const second = await invoke(makeRequest('/api/weather?city=london', { origin: LOCAL_ORIGIN }));
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(second.headers.get('Access-Control-Allow-Origin'), LOCAL_ORIGIN);
  assert.equal(upstreamCalls, 1);
});

test('uses normalized city cache keys and stores the 60-second cache lifetime', async () => {
  const { entries } = installCache();
  globalThis.fetch = async () => Response.json(validPayload);
  await invoke(makeRequest('/api/weather?city=New%20York'));
  const firstKey = [...entries.keys()][0];
  assert.equal(new URL(firstKey).pathname, '/__weather_cache');
  assert.equal(new URL(firstKey).searchParams.get('city'), 'new york');
  assert.equal(entries.get(firstKey).headers.get('Cache-Control'), 'public, max-age=60');
  await invoke(makeRequest('/api/weather?city=new%20york'));
  assert.equal(entries.size, 1);
  await invoke(makeRequest('/api/weather?city=Paris'));
  assert.equal(entries.size, 2);
});

test('ignores asynchronous cache write failures on successful requests', async () => {
  const cache = {
    async match() { return undefined; },
    async put() { throw new Error(`cache failed with ${API_KEY}`); },
  };
  Object.defineProperty(globalThis, 'caches', { configurable: true, value: { default: cache } });
  globalThis.fetch = async () => Response.json(validPayload);
  const response = await invoke(makeRequest());
  assert.equal(response.status, 200);
  assert.equal((await response.text()).includes(API_KEY), false);
});

test('unexpected exceptions return generic JSON without details, URLs, or secrets', async () => {
  const env = new Proxy({}, { get() { throw new Error(`unexpected failure ${API_KEY}`); } });
  const response = await invoke(makeRequest(), env);
  const body = await response.text();
  assert.equal(response.status, 500);
  assert.match(response.headers.get('Content-Type'), /application\/json/u);
  assert.equal(body.includes(API_KEY), false);
  assert.equal(body.includes('unexpected failure'), false);
  assert.equal(body.includes(BASE_URL), false);
});

test('does not require an API key or contact upstream for CORS and validation errors', async () => {
  globalThis.fetch = async () => assert.fail('upstream should not be called');
  const env = makeEnv({ WEATHER_API_KEY: undefined });
  const invalid = await invoke(makeRequest('/api/weather?city='), env);
  const missingKey = await invoke(makeRequest(), env);

  assert.equal(invalid.status, 400);
  assert.equal(missingKey.status, 503);
  assert.equal(JSON.stringify(await missingKey.json()).includes(API_KEY), false);
});
