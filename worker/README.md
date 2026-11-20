# Weather API Worker

This Worker provides `GET /api/weather?city=<city>` for the static GitHub Pages frontend. It reads the WeatherAPI credential only from the `WEATHER_API_KEY` Worker environment binding and returns only the location name, country, temperature, feels-like temperature, humidity, and wind speed.

## Local development

Install dependencies with `npm ci`, then start the local Worker:

```sh
npm run worker:dev
```

The Worker listens on `http://localhost:8787`; the frontend development origin allowed by CORS is `http://localhost:8080`.

To test locally, set `WEATHER_API_KEY` in `worker/.dev.vars`. Keep this file private; it is excluded by `.gitignore`. Wrangler exposes that local value as `env.WEATHER_API_KEY`. For a deployed Worker, configure it with Wrangler's secret command rather than a plaintext Wrangler variable:

```sh
npx wrangler secret put WEATHER_API_KEY --config worker/wrangler.toml
```

The frontend now calls this Worker and does not receive or bundle the WeatherAPI credential. The Worker reads the credential only from `env.WEATHER_API_KEY` when configured.

## Development and deployment commands

```sh
npm test
npm run worker:dev
npm run worker:deploy
```

`worker:deploy` is provided for a later, intentional deployment. Do not run it as part of local development.

## Endpoint behavior

- Only `GET /api/weather` and CORS preflight `OPTIONS /api/weather` are accepted.
- `city` must appear once, contain 1–100 supported Unicode letters/numbers and common city punctuation, and is trimmed with repeated whitespace collapsed.
- CORS permits only `https://msdanmalan.github.io` and `http://localhost:8080`.
- The rate-limiting binding allows 30 requests per minute per client IP. Requests to the endpoint, including invalid requests and CORS preflights, consume the allowance. Cloudflare's rate limiting is approximate and applies per Cloudflare location.
- Successful weather responses advertise a 60-second cache lifetime and are stored with the Workers Cache API when available. Cache API entries are local to a Cloudflare data center and are not shared globally or tiered. Cloudflare's documentation does not explicitly guarantee Cache API behavior for `workers.dev`; treat it as best-effort on that hostname and verify behavior for the deployed Worker. The browser-facing successful response still carries `Cache-Control: public, max-age=60`. Errors are not cached.
- Upstream requests time out after five seconds. Client responses do not include upstream error details.
- When WeatherAPI returns provider error code `1006`, the Worker responds with HTTP `404` and `{ "error": { "code": "city_not_found", "message": "City not found. Please check the city name and try again." } }`. Other unsuccessful or unreadable upstream error responses return a generic HTTP `502` `upstream_failure` response. Upstream messages and response bodies are never forwarded.
- Wrangler query-string redaction is enabled so query strings in Cloudflare logs and traces are removed. Do not add custom logging of secrets or full upstream URLs.

The static GitHub Pages frontend is integrated with this Worker through the configured public Worker hostname.
