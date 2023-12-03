async function getWeather(location) {
  const city = await fetch(`https://api.weatherapi.com/v1/current.json?key=7b7c664da3fe4546973105636230112&q=${location}`);
  try {
    if (!city.ok) {
      throw new Error(`Failed to fetch weather status. Status: ${city.status}`);
    }

    const weatherStatus = await city.json();
    return weatherStatus;
  } catch (e) {
    console.error(e);
  }
}

async function extractWeatherDetails(city) {
  const appDetails = await getWeather(city);
  const appDetailsObj = {
    name: appDetails.location.name,
    country: appDetails.location.country,
    temp_c: appDetails.current.temp_c,
    feelslike_c: appDetails.current.feelslike_c,
    humidity: appDetails.current.humidity,
    wind_kph: appDetails.current.wind_kph,
  };
  return (appDetailsObj);
}

export default extractWeatherDetails;
