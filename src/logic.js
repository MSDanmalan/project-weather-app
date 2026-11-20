const WEATHER_WORKER_BASE_URL = 'https://project-weather-api.msdanmallan.workers.dev';

const ERROR_MESSAGES = {
  invalidCity: 'Check the city name and try again.',
  tooManyRequests: 'Too many searches. Please wait a moment and try again.',
  unavailable: 'Weather service is temporarily unavailable. Please try again.',
  invalidResponse: 'Weather service returned an invalid response. Please try again.',
  network: 'Unable to connect to the weather service. Check your connection and try again.',
};

function hasValidWeatherFields(weather) {
  return weather !== null
    && typeof weather === 'object'
    && !Array.isArray(weather)
    && typeof weather.name === 'string'
    && typeof weather.country === 'string'
    && Number.isFinite(weather.temp_c)
    && Number.isFinite(weather.feelslike_c)
    && Number.isFinite(weather.humidity)
    && Number.isFinite(weather.wind_kph);
}

async function extractWeatherDetails(city) {
  if (typeof city !== 'string' || city.trim() === '') {
    throw new Error(ERROR_MESSAGES.invalidCity);
  }

  const url = new URL('/api/weather', WEATHER_WORKER_BASE_URL);
  url.searchParams.set('city', city);

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(ERROR_MESSAGES.network);
  }

  if (!response.ok) {
    if (response.status === 400) throw new Error(ERROR_MESSAGES.invalidCity);
    if (response.status === 429) throw new Error(ERROR_MESSAGES.tooManyRequests);
    throw new Error(ERROR_MESSAGES.unavailable);
  }

  let weather;
  try {
    weather = await response.json();
  } catch {
    throw new Error(ERROR_MESSAGES.invalidResponse);
  }

  if (!hasValidWeatherFields(weather)) {
    throw new Error(ERROR_MESSAGES.invalidResponse);
  }

  return weather;
}

export default extractWeatherDetails;
