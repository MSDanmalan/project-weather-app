import extractWeatherDetails from './logic';

const displayElement = document.querySelector('.display');
const cityNameElement = document.querySelector('.city-name');
const countryElement = document.querySelector('.country');
const tempElement = document.querySelector('.temp');
const feelsLikeElement = document.querySelector('.feels-like');
const humidityElement = document.querySelector('.humidity');
const windElement = document.querySelector('.wind');
const inputCityElement = document.getElementById('city');
const submitButtonElement = document.getElementById('submit-button');

function populateDisplay() {
  submitButtonElement.addEventListener('click', async (event) => {
    event.preventDefault();
    const inputValue = inputCityElement.value;

    if (inputValue.trim() !== '') {
      const appDetailsObj = await extractWeatherDetails(inputValue);
      console.log(appDetailsObj);
      cityNameElement.textContent = `${appDetailsObj.name}, `;
      countryElement.textContent = appDetailsObj.country;
      tempElement.textContent = `${appDetailsObj.temp_c} °C`;
      feelsLikeElement.textContent = `Feels like: ${appDetailsObj.feelslike_c} °C`;
      humidityElement.textContent = `Humidity: ${appDetailsObj.humidity}%`;
      windElement.textContent = `Wind: ${appDetailsObj.wind_kph} kmph`;
      displayElement.setAttribute('style', 'display: flex;');
    }
  });
}

export default populateDisplay;
