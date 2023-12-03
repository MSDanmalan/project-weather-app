/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/dom.js":
/*!********************!*\
  !*** ./src/dom.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _logic__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logic */ "./src/logic.js");


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
      const appDetailsObj = await (0,_logic__WEBPACK_IMPORTED_MODULE_0__["default"])(inputValue);
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (populateDisplay);


/***/ }),

/***/ "./src/logic.js":
/*!**********************!*\
  !*** ./src/logic.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (extractWeatherDetails);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dom */ "./src/dom.js");


console.log('hi');

(0,_dom__WEBPACK_IMPORTED_MODULE_0__["default"])();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBNEM7O0FBRTVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtDQUFrQyxrREFBcUI7QUFDdkQ7QUFDQSx1Q0FBdUMsbUJBQW1CO0FBQzFEO0FBQ0EsbUNBQW1DLHNCQUFzQjtBQUN6RCxvREFBb0QsMkJBQTJCO0FBQy9FLGlEQUFpRCx1QkFBdUI7QUFDeEUseUNBQXlDLHdCQUF3QjtBQUNqRSwwREFBMEQ7QUFDMUQ7QUFDQSxHQUFHO0FBQ0g7O0FBRUEsaUVBQWUsZUFBZSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUMvQi9CO0FBQ0EsK0dBQStHLFNBQVM7QUFDeEg7QUFDQTtBQUNBLGlFQUFpRSxZQUFZO0FBQzdFOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxxQkFBcUIsRUFBQzs7Ozs7OztVQzNCckM7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7OztBQ05vQzs7QUFFcEM7O0FBRUEsZ0RBQWUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcm9qZWN0LXdlYXRoZXItYXBwLy4vc3JjL2RvbS5qcyIsIndlYnBhY2s6Ly9wcm9qZWN0LXdlYXRoZXItYXBwLy4vc3JjL2xvZ2ljLmpzIiwid2VicGFjazovL3Byb2plY3Qtd2VhdGhlci1hcHAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcHJvamVjdC13ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vcHJvamVjdC13ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3Byb2plY3Qtd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9wcm9qZWN0LXdlYXRoZXItYXBwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHRyYWN0V2VhdGhlckRldGFpbHMgZnJvbSAnLi9sb2dpYyc7XG5cbmNvbnN0IGRpc3BsYXlFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRpc3BsYXknKTtcbmNvbnN0IGNpdHlOYW1lRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaXR5LW5hbWUnKTtcbmNvbnN0IGNvdW50cnlFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvdW50cnknKTtcbmNvbnN0IHRlbXBFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRlbXAnKTtcbmNvbnN0IGZlZWxzTGlrZUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmVlbHMtbGlrZScpO1xuY29uc3QgaHVtaWRpdHlFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmh1bWlkaXR5Jyk7XG5jb25zdCB3aW5kRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53aW5kJyk7XG5jb25zdCBpbnB1dENpdHlFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NpdHknKTtcbmNvbnN0IHN1Ym1pdEJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VibWl0LWJ1dHRvbicpO1xuXG5mdW5jdGlvbiBwb3B1bGF0ZURpc3BsYXkoKSB7XG4gIHN1Ym1pdEJ1dHRvbkVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IGlucHV0VmFsdWUgPSBpbnB1dENpdHlFbGVtZW50LnZhbHVlO1xuXG4gICAgaWYgKGlucHV0VmFsdWUudHJpbSgpICE9PSAnJykge1xuICAgICAgY29uc3QgYXBwRGV0YWlsc09iaiA9IGF3YWl0IGV4dHJhY3RXZWF0aGVyRGV0YWlscyhpbnB1dFZhbHVlKTtcbiAgICAgIGNvbnNvbGUubG9nKGFwcERldGFpbHNPYmopO1xuICAgICAgY2l0eU5hbWVFbGVtZW50LnRleHRDb250ZW50ID0gYCR7YXBwRGV0YWlsc09iai5uYW1lfSwgYDtcbiAgICAgIGNvdW50cnlFbGVtZW50LnRleHRDb250ZW50ID0gYXBwRGV0YWlsc09iai5jb3VudHJ5O1xuICAgICAgdGVtcEVsZW1lbnQudGV4dENvbnRlbnQgPSBgJHthcHBEZXRhaWxzT2JqLnRlbXBfY30gwrBDYDtcbiAgICAgIGZlZWxzTGlrZUVsZW1lbnQudGV4dENvbnRlbnQgPSBgRmVlbHMgbGlrZTogJHthcHBEZXRhaWxzT2JqLmZlZWxzbGlrZV9jfSDCsENgO1xuICAgICAgaHVtaWRpdHlFbGVtZW50LnRleHRDb250ZW50ID0gYEh1bWlkaXR5OiAke2FwcERldGFpbHNPYmouaHVtaWRpdHl9JWA7XG4gICAgICB3aW5kRWxlbWVudC50ZXh0Q29udGVudCA9IGBXaW5kOiAke2FwcERldGFpbHNPYmoud2luZF9rcGh9IGttcGhgO1xuICAgICAgZGlzcGxheUVsZW1lbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBmbGV4OycpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHBvcHVsYXRlRGlzcGxheTtcbiIsImFzeW5jIGZ1bmN0aW9uIGdldFdlYXRoZXIobG9jYXRpb24pIHtcbiAgY29uc3QgY2l0eSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS53ZWF0aGVyYXBpLmNvbS92MS9jdXJyZW50Lmpzb24/a2V5PTdiN2M2NjRkYTNmZTQ1NDY5NzMxMDU2MzYyMzAxMTImcT0ke2xvY2F0aW9ufWApO1xuICB0cnkge1xuICAgIGlmICghY2l0eS5vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggd2VhdGhlciBzdGF0dXMuIFN0YXR1czogJHtjaXR5LnN0YXR1c31gKTtcbiAgICB9XG5cbiAgICBjb25zdCB3ZWF0aGVyU3RhdHVzID0gYXdhaXQgY2l0eS5qc29uKCk7XG4gICAgcmV0dXJuIHdlYXRoZXJTdGF0dXM7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGV4dHJhY3RXZWF0aGVyRGV0YWlscyhjaXR5KSB7XG4gIGNvbnN0IGFwcERldGFpbHMgPSBhd2FpdCBnZXRXZWF0aGVyKGNpdHkpO1xuICBjb25zdCBhcHBEZXRhaWxzT2JqID0ge1xuICAgIG5hbWU6IGFwcERldGFpbHMubG9jYXRpb24ubmFtZSxcbiAgICBjb3VudHJ5OiBhcHBEZXRhaWxzLmxvY2F0aW9uLmNvdW50cnksXG4gICAgdGVtcF9jOiBhcHBEZXRhaWxzLmN1cnJlbnQudGVtcF9jLFxuICAgIGZlZWxzbGlrZV9jOiBhcHBEZXRhaWxzLmN1cnJlbnQuZmVlbHNsaWtlX2MsXG4gICAgaHVtaWRpdHk6IGFwcERldGFpbHMuY3VycmVudC5odW1pZGl0eSxcbiAgICB3aW5kX2twaDogYXBwRGV0YWlscy5jdXJyZW50LndpbmRfa3BoLFxuICB9O1xuICByZXR1cm4gKGFwcERldGFpbHNPYmopO1xufVxuXG5leHBvcnQgZGVmYXVsdCBleHRyYWN0V2VhdGhlckRldGFpbHM7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBwb3B1bGF0ZURpc3BsYXkgZnJvbSAnLi9kb20nO1xuXG5jb25zb2xlLmxvZygnaGknKTtcblxucG9wdWxhdGVEaXNwbGF5KCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=