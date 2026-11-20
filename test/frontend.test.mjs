import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import extractWeatherDetails from '../src/logic.js';

const originalFetch = globalThis.fetch;

const validWeather = {
  name: 'St. John’s',
  country: 'Canada',
  temp_c: 12.5,
  feelslike_c: 10.2,
  humidity: 71,
  wind_kph: 14.4,
};

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('returns the flat Worker response after validating all fields', async () => {
  globalThis.fetch = async () => Response.json(validWeather);

  const weather = await extractWeatherDetails('St. John’s');

  assert.deepEqual(weather, validWeather);
});

test('URL-encodes the city and sends only the city query parameter to the Worker', async () => {
  let requestUrl;
  let requestOptions;
  const city = 'São Tomé & Príncipe';
  globalThis.fetch = async (input, options) => {
    requestUrl = new URL(input);
    requestOptions = options;
    return Response.json(validWeather);
  };

  await extractWeatherDetails(city);

  assert.equal(requestUrl.origin, 'https://project-weather-api.msdanmallan.workers.dev');
  assert.equal(requestUrl.pathname, '/api/weather');
  assert.equal(requestUrl.searchParams.get('city'), city);
  assert.deepEqual([...requestUrl.searchParams.keys()], ['city']);
  assert.equal(requestOptions, undefined);
  assert.equal(requestUrl.href.includes('api.weatherapi.com'), false);
});

test('maps HTTP errors to safe, useful messages', async (t) => {
  for (const [status, message] of [
    [400, 'Check the city name and try again.'],
    [429, 'Too many searches. Please wait a moment and try again.'],
    [502, 'Weather service is temporarily unavailable. Please try again.'],
  ]) {
    await t.test(String(status), async () => {
      globalThis.fetch = async () => new Response('upstream details are private', { status });
      await assert.rejects(extractWeatherDetails('London'), (error) => {
        assert.equal(error.message, message);
        assert.equal(error.message.includes('upstream details'), false);
        return true;
      });
    });
  }
});

test('handles invalid JSON and malformed Worker responses', async (t) => {
  await t.test('invalid JSON', async () => {
    globalThis.fetch = async () => new Response('{', { status: 200 });
    await assert.rejects(extractWeatherDetails('London'), /invalid response/u);
  });

  for (const [label, weather] of [
    ['null response', null],
    ['missing field', { ...validWeather, wind_kph: undefined }],
    ['wrong field type', { ...validWeather, humidity: '71' }],
    ['array response', [validWeather]],
  ]) {
    await t.test(label, async () => {
      globalThis.fetch = async () => Response.json(weather);
      await assert.rejects(extractWeatherDetails('London'), /invalid response/u);
    });
  }
});

test('maps network failures to a safe message', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('network detail');
  };

  await assert.rejects(extractWeatherDetails('London'), (error) => {
    assert.equal(error.message, 'Unable to connect to the weather service. Check your connection and try again.');
    assert.equal(error.message.includes('network detail'), false);
    return true;
  });
});
