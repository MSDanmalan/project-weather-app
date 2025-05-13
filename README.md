# 🌤️ project-Weather App
A fully client-side weather application that demonstrates API integration skills using WeatherAPI. Built with modern JavaScript, bundled using Webpack, and styled with clean, responsive CSS. This project is part of my portfolio to showcase front-end skills with API interaction and development tooling.

## Live preview
https://msdanmalan.github.io/project-weather-app/

## 🎯 Key Highlights
- Real-Time Weather Data via WeatherAPI
- City Search Functionality for global weather access
- Responsive Design with minimalistic UI
- Modular JavaScript structured for clarity
- Built with Webpack for bundling and development
- Linted with ESLint for clean, consistent code
- Deployed via GitHub Pages

## 🔧 Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- WeatherAPI
- Webpack
- npm
- ESLint

## 📦 Project Structure
project-weather-app/
├── dist/                 # Production-ready build
├── src/
│   ├── index.html        # HTML template
│   ├── styles.css        # Styles
│   ├── main.js           # DOM logic
│   ├── logic.js          # API interaction
├── .eslintrc.json        # ESLint configuration
├── webpack.config.js     # Webpack configuration
├── package.json          # Project metadata & scripts

## 🔌 API Integration
This app consumes the WeatherAPI to fetch and display current weather details based on user input. Here's a breakdown of the API workflow:

1. User inputs a city
2. JavaScript fetches weather data using:

fetch(`https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=${city}`);
Data is extracted, parsed, and rendered on the UI dynamically.

API fields used:
- location.name
- location.country
- current.temp_c
- current.feelslike_c
- current.humidity
- current.wind_kph

## 📖 License
This project is licensed under the MIT License.