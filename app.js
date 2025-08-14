const apiKey = "76d9e9267aa523fb07259ed14d3bc6f0";
const apiBaseUrl = "https://api.openweathermap.org/data/2.5/forecast";

const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const weatherInfo = document.getElementById("weatherInfo");
const locationElement = document.getElementById("location");
const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");
const feelsLikeElement = document.getElementById("feelsLike");
const windElement = document.getElementById("wind");
const weatherIconElement = document.getElementById("weatherIcon");
const recentSearches = document.getElementById("recentSearches");
const forecastCards = document.getElementById("forecastCards");
const earthIconElement = document.getElementById("earthIcon");

searchButton.addEventListener("click", () => {
  const location = cityInput.value.trim();
  if (location === "") {
    locationElement.textContent = "Bugün hava nasıl?";
    temperatureElement.textContent = "";
    descriptionElement.textContent = "";
    feelsLikeElement.textContent = "";
    windElement.textContent = "";
    weatherIconElement.src = "";
    weatherIconElement.alt = "";
    weatherIconElement.classList.add("weatherIcon-hidden");
    earthIconElement.classList.remove("earthIcon-hidden");
    return;
  } else {
    earthIconElement.classList.add("earthIcon-hidden");
  }
  saveToRecentSearches(location);
  fetchWeather(location);
  displayRecentSearches();
});

function fetchWeather(location) {
  const url = `${apiBaseUrl}?q=${location}&appid=${apiKey}&units=metric&lang=tr`;

  window.localStorage.setItem("lastSearchedCity", location);
  cityInput.value = location;
  weatherInfo.style.display = "block";

  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const forecast = data.list[0];

      locationElement.textContent = data.city.name;
      temperatureElement.textContent = `${Math.round(forecast.main.temp)}°C`;
      descriptionElement.textContent = forecast.weather[0].description;
      feelsLikeElement.textContent = `Hissedilen ${Math.round(
        forecast.main.feels_like
      )}°C`;
      windElement.textContent = `Rüzgar ${Math.round(
        forecast.wind.speed
      )} km/s`;

      const iconCode = forecast.weather[0].icon;
      const iconUrl = `./icons/${iconCode}.png`;
      weatherIconElement.src = iconUrl;
      weatherIconElement.alt = forecast.weather[0].description;
      weatherIconElement.classList.remove("weatherIcon-hidden");

      const dailyForecasts = {};
      data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        const hour = item.dt_txt.split(" ")[1];
        if (hour === "12:00:00") {
          dailyForecasts[date] = item;
        }
      });
      const forecastList = Object.values(dailyForecasts).slice(0, 7);
      displayForecast(forecastList);
    })
    .catch((error) => {
      console.error("Hava durumu verisi alınamadı:", error);
      locationElement.textContent = "Lütfen geçerli bir şehir adı giriniz.";
      temperatureElement.textContent = "";
      descriptionElement.textContent = "";
      feelsLikeElement.textContent = "";
      windElement.textContent = "";
      weatherIconElement.src = "";
      weatherIconElement.classList.add("weatherIcon-hidden");
      forecastCards.innerHTML = "";
    });
}

function saveToRecentSearches(city) {
  let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];

  city = city.trim();
  if (!searches.includes(city)) {
    searches.unshift(city);
    localStorage.setItem("recentSearches", JSON.stringify(searches));
  }
}

function displayRecentSearches() {
  let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  recentSearches.innerHTML = "";
  searches.slice(0, 7).forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => {
      cityInput.value = city;
      fetchWeather(city);
    });
    recentSearches.appendChild(li);
  });
}

function displayForecast(forecastList) {
  forecastCards.innerHTML = "";
  if (!forecastList || forecastList.length === 0) {
    forecastCards.innerHTML =
      '<div style="color:#08a6abed;">Tahmin verisi yok</div>';
    return;
  }
  forecastList.forEach((day) => {
    const date = new Date(day.dt_txt);
    const dayName = date.toLocaleDateString("tr-TR", {
      weekday: "long",
    });
    const iconCode = day.weather[0].icon;
    const iconUrl = `./icons/${iconCode}.png`;
    const temp = Math.round(day.main.temp);
    const desc = day.weather[0].description;

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <img class="forecast-icon" src="${iconUrl}" alt="${desc}" />
      <div class="forecast-temp">${temp}°C</div>
      <div class="forecast-desc">${desc}</div>`;
    forecastCards.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", displayRecentSearches);
