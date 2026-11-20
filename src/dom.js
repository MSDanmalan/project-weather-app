import extractWeatherDetails from './logic.js';

function populateDisplay(documentRef = document, lookupWeather = extractWeatherDetails) {
  const displayElement = documentRef.querySelector('.display');
  const cityNameElement = documentRef.querySelector('.city-name');
  const countryElement = documentRef.querySelector('.country');
  const tempElement = documentRef.querySelector('.temp');
  const feelsLikeElement = documentRef.querySelector('.feels-like');
  const humidityElement = documentRef.querySelector('.humidity');
  const windElement = documentRef.querySelector('.wind');
  const inputCityElement = documentRef.getElementById('city');
  const submitButtonElement = documentRef.getElementById('submit-button');
  const errorMessageElement = documentRef.createElement('p');

  errorMessageElement.setAttribute('role', 'alert');
  errorMessageElement.setAttribute('aria-live', 'assertive');
  errorMessageElement.hidden = true;
  submitButtonElement.parentElement.insertAdjacentElement('afterend', errorMessageElement);

  submitButtonElement.addEventListener('click', async (event) => {
    event.preventDefault();
    const inputValue = inputCityElement.value;

    if (inputValue.trim() !== '') {
      errorMessageElement.textContent = '';
      errorMessageElement.hidden = true;
      displayElement.setAttribute('style', 'display: none;');
      cityNameElement.textContent = '';
      countryElement.textContent = '';
      tempElement.textContent = '';
      feelsLikeElement.textContent = '';
      humidityElement.textContent = '';
      windElement.textContent = '';

      try {
        const appDetailsObj = await lookupWeather(inputValue);
        cityNameElement.textContent = `${appDetailsObj.name}, `;
        countryElement.textContent = appDetailsObj.country;
        tempElement.textContent = `${appDetailsObj.temp_c} °C`;
        feelsLikeElement.textContent = `Feels like: ${appDetailsObj.feelslike_c} °C`;
        humidityElement.textContent = `Humidity: ${appDetailsObj.humidity}%`;
        windElement.textContent = `Wind: ${appDetailsObj.wind_kph} kmph`;
        displayElement.setAttribute('style', 'display: flex;');
      } catch (error) {
        errorMessageElement.textContent = error instanceof Error
          ? error.message
          : 'Unable to retrieve weather. Please try again.';
        errorMessageElement.hidden = false;
      }
    }
  });
}

export default populateDisplay;
