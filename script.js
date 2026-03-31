// Configuration
const API_KEY = "Use Your Key Here"; // Using a public demo key or user should replace with their own
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// DOM Elements
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherContent = document.getElementById("weather-content");
const loadingSpinner = document.getElementById("loading-spinner");
const errorMessage = document.getElementById("error-message");
const welcomeMessage = document.getElementById("welcome-message");
const unitCToggle = document.getElementById("unit-c");
const unitFToggle = document.getElementById("unit-f");

// Weather Data Elements
const cityNameDisplay = document.getElementById("city-name");
const localTimeDisplay = document.getElementById("local-time");
const weatherIcon = document.getElementById("weather-icon");
const currentTempDisplay = document.getElementById("current-temp");
const weatherDescDisplay = document.getElementById("weather-desc");
const feelsLikeDisplay = document.getElementById("feels-like");
const minMaxTempDisplay = document.getElementById("min-max-temp");
const humidityDisplay = document.getElementById("humidity");
const windSpeedDisplay = document.getElementById("wind-speed");
const windDirDisplay = document.getElementById("wind-dir");
const windGustDisplay = document.getElementById("wind-gust");
const cloudsDisplay = document.getElementById("clouds");
const pressureDisplay = document.getElementById("pressure");
const visibilityDisplay = document.getElementById("visibility");
const sunriseDisplay = document.getElementById("sunrise");
const sunsetDisplay = document.getElementById("sunset");
const countryCodeDisplay = document.getElementById("country-code");

// State
let currentUnit = localStorage.getItem("batas-unit") || "metric"; // 'metric' for C, 'imperial' for F
let lastCity = localStorage.getItem("batas-last-city") || "";
let timeInterval = null;

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  updateUnitUI();
  if (lastCity) {
    fetchWeather(lastCity);
  }
});

// Event Listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
});

unitCToggle.addEventListener("click", () => {
  if (currentUnit !== "metric") {
    currentUnit = "metric";
    localStorage.setItem("batas-unit", "metric");
    updateUnitUI();
    if (lastCity) fetchWeather(lastCity);
  }
});

unitFToggle.addEventListener("click", () => {
  if (currentUnit !== "imperial") {
    currentUnit = "imperial";
    localStorage.setItem("batas-unit", "imperial");
    updateUnitUI();
    if (lastCity) fetchWeather(lastCity);
  }
});

// Functions
async function fetchWeather(city) {
  showLoading();
  try {
    const response = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`,
    );
    const data = await response.json();

    if (data.cod === 200) {
      updateWeatherUI(data);
      lastCity = data.name;
      localStorage.setItem("batas-last-city", lastCity);
      showContent();
    } else {
      showError();
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
    showError();
  }
}

function updateWeatherUI(data) {
  const { name, main, weather, wind, clouds, sys, timezone, visibility } = data;
  const unitSymbol = currentUnit === "metric" ? "C" : "F";
  const speedUnit = currentUnit === "metric" ? "km/h" : "mph";

  // Basic Info
  cityNameDisplay.textContent = `${name}, ${sys.country}`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
  currentTempDisplay.textContent = Math.round(main.temp);
  weatherDescDisplay.textContent = weather[0].description;

  // Detailed Stats
  feelsLikeDisplay.textContent = `${Math.round(main.feels_like)}°${unitSymbol}`;
  minMaxTempDisplay.textContent = `${Math.round(main.temp_min)}° / ${Math.round(main.temp_max)}°`;
  humidityDisplay.textContent = `${main.humidity}%`;

  // Wind (Convert m/s to km/h if metric)
  const windSpeed =
    currentUnit === "metric"
      ? (wind.speed * 3.6).toFixed(1)
      : wind.speed.toFixed(1);
  windSpeedDisplay.textContent = `${windSpeed} ${speedUnit}`;
  windDirDisplay.textContent = `${wind.deg}°`;

  const windGust = wind.gust
    ? currentUnit === "metric"
      ? (wind.gust * 3.6).toFixed(1)
      : wind.gust.toFixed(1)
    : "N/A";
  windGustDisplay.textContent =
    windGust !== "N/A" ? `${windGust} ${speedUnit}` : "N/A";

  cloudsDisplay.textContent = `${clouds.all}%`;
  pressureDisplay.textContent = `${main.pressure} hPa`;
  visibilityDisplay.textContent = `${(visibility / 1000).toFixed(1)} km`;

  // Times
  sunriseDisplay.textContent = formatTime(sys.sunrise, timezone);
  sunsetDisplay.textContent = formatTime(sys.sunset, timezone);
  countryCodeDisplay.textContent = sys.country;

  // Live Clock
  startLiveClock(timezone);

  // Dynamic Background
  updateBackground(weather[0].main, weather[0].icon);
}

function formatTime(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return (
    date.getUTCHours().toString().padStart(2, "0") +
    ":" +
    date.getUTCMinutes().toString().padStart(2, "0")
  );
}

function startLiveClock(timezoneOffset) {
  if (timeInterval) clearInterval(timeInterval);

  const updateClock = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cityTime = new Date(utc + 1000 * timezoneOffset);

    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    localTimeDisplay.textContent = `Local Time: ${cityTime.toLocaleString("en-US", options)}`;
  };

  updateClock();
  timeInterval = setInterval(updateClock, 1000);
}

function updateBackground(condition, icon) {
  const body = document.body;
  const isNight = icon.includes("n");

  if (isNight) {
    body.style.background = "var(--bg-night)";
    return;
  }

  switch (condition.toLowerCase()) {
    case "clear":
      body.style.background = "var(--bg-clear)";
      break;
    case "clouds":
      body.style.background = "var(--bg-cloudy)";
      break;
    case "rain":
    case "drizzle":
    case "thunderstorm":
      body.style.background = "var(--bg-rainy)";
      break;
    default:
      body.style.background = "var(--bg-default)";
  }
}

function updateUnitUI() {
  if (currentUnit === "metric") {
    unitCToggle.classList.add("active");
    unitFToggle.classList.remove("active");
  } else {
    unitFToggle.classList.add("active");
    unitCToggle.classList.remove("active");
  }
}

function showLoading() {
  loadingSpinner.classList.remove("hidden");
  weatherContent.classList.add("hidden");
  errorMessage.classList.add("hidden");
  welcomeMessage.classList.add("hidden");
}

function showContent() {
  loadingSpinner.classList.add("hidden");
  weatherContent.classList.remove("hidden");
  errorMessage.classList.add("hidden");
  welcomeMessage.classList.add("hidden");
}

function showError() {
  loadingSpinner.classList.add("hidden");
  weatherContent.classList.add("hidden");
  errorMessage.classList.remove("hidden");
  welcomeMessage.classList.add("hidden");
}
