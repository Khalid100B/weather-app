import "./style.css";

const apiKey = "324720f5f3c9ebc582689b45f19a770e";
const cityName = document.getElementById('cityInput')
const submitBtn = document.getElementById('submit-btn')
const weatherContainer = document.getElementById('weather-container')

// the button which show the weather upon clicking on it
submitBtn.addEventListener('click', async event => {
  event.preventDefault()
  const city = cityName.value.trim()
  if(city){
    try{
      const [ currentData, forecastData ] = await Promise.all([
        getCurrentData(city),
        getForecastData(city)
      ])
      const placeholderContainer = document.querySelector('.container').classList.add('hidden!')

      if(weatherContainer.classList.contains('hidden!')){
        weatherContainer.classList.toggle('hidden!')
      }

      // adding the weather information in the display
      weatherContainer.innerHTML = displayWeatherData(currentData, forecastData);
      draggableForecast()
    }
    catch(err){
      console.log("Something went wrong: ", err.message)
    }
  }
})


// display weather data
const displayWeatherData = (currentData, forecastData) => {
  return `
      <!-- the main place where temprature will show for the current day -->
      <div class="flex flex-col justify-between px-5 py-10 w-65 rounded-4xl absolute -top-3 -left-3 -bottom-3.5 bg-black/10 backdrop-blur-3xl z-20 border border-gray-200/12 shadow-2xl">
        <!-- the upperside of the current temp -->
        <div class="flex flex-col items-center justify-center">
          <p id="curr-day" class="font-bold text-4xl font-surfer">${new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(new Date(currentData.dt * 1000))}</p>
          <p id="curr-date" class="text-lg font-poppins text-white/85">${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(currentData.dt * 1000))}</p>
          <div class="flex items-center justify-center gap-x-1 -ml-4">
            <img src="/svgs/location-svgrepo-com.svg" width="30">
            <p id="curr-city" class="text-white/85"><span>${currentData.name}</span>, <span>${currentData.sys.country}</span></p>
          </div>
        </div>
        <!-- the lower side of the current temp -->
        <div class="flex items-start justify-center flex-col gap-y-2 ml-3">
          <div class="flex items-center justify-around -mb-2">
            <p id="temp" class="font-poppins text-5xl font-bold text-white/95">${Math.round(currentData.main.temp)}°C</p>
            <img src="https://openweathermap.org/payload/api/media/file/${currentData.weather[0].icon}.png" alt="">
          </div>
          <p id="des" class="font-bold text-xl font-poppins text-white/80">${currentData.weather[0].description}</p>
          <p class="text-white/70 text-md space-x-2 tracking-widest font-short">Feels like <span class="text-white font-bold text-lg font-poppins">${Math.round(currentData.main.feels_like)}</span>°C</p>
        </div>
      </div>

      <!-- it will show the details of the waeather in the following day -->
      <div class="pl-66 pr-5 py-3.5 w-full">
        <!-- Some details about the weather -->
        <div class="border px-4 py-3 rounded-2xl border-white/15 shadow-2xl">
          <!-- PRECIPITATION -->
          <div class="flex justify-between border-b border-white/5 pb-1">
            <p class="uppercase font-short">PRECIPITATION</p>
            <p class="font-poppins">${forecastData.list[0].pop * 100}%</p>
          </div>
          <!-- humidity -->
          <div class="flex justify-between border-b border-white/5 py-1">
            <p class="uppercase font-short">humidity</p>
            <p class="font-poppins">${currentData.main.humidity}</p>
          </div>
          <!-- air quality -->
          <div class="flex justify-between border-b border-white/5 py-1">
            <p class="uppercase font-short">Cloudiness</p>
            <p class="font-poppins">${currentData.clouds.all}%</p>
          </div>
          <!-- wind speed -->
          <div class="flex justify-between mt-1">
            <p class="uppercase font-short">Wind speed</p>
            <p class="font-poppins">${currentData.wind.speed} km/h</p>
          </div>
        </div>

        <!-- sunrise and sunset time -->
        <div class="flex items-center justify-around mt-2 gap-x-2">
          <div id="sunrise-time" class="px-9 py-1 rounded-xl shadow-2xl border border-white/5 flex-1 flex justify-center items-center flex-col">
            <img src="/svgs/sunrise.svg" width="70">
            <p class="font-semibold font-poppins text-center">${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric'}).format(new Date(currentData.sys.sunrise * 1000))}</p>
          </div>
          <div id="sunset-time" class="px-9 py-1 rounded-xl shadow-2xl border border-white/5 flex-1 flex justify-center items-center flex-col">
            <img src="/svgs/sunset.svg" width="70">
            <p class="font-semibold font-poppins text-center">${new Intl.DateTimeFormat('en-US', {hour: 'numeric', minute: 'numeric'}).format(new Date(currentData.sys.sunset * 1000))}</p>
          </div>
        </div>
        
        <!-- weather forecast for next 7 days -->
         <div id="forecast-container" class="overflow-x-auto scrollbar-none mt-2 flex gap-x-2 select-none">
          <!-- each days -->
          ${forecastData.list.map(data => {

            return `
            <div class="flex flex-col justify-center items-center border border-white/5 rounded-xl py-1.5 px-2 text-[14px] backdrop-blur-2xl cursor-pointer min-w-18">
              <p id="forcast-hourly" class="uppercase">${new Intl.DateTimeFormat('en-US', {hour: 'numeric'}).format(new Date(data.dt * 1000))}</p>
              <img src="https://openweathermap.org/payload/api/media/file/${data.weather[0].icon}.png" width="45">
              <p class="text-sm">${Math.round(data.main.temp)}°C</p>
            </div>
            `
          }).join('')}
         </div>
      </div>
  `
}

// getting the current or HERO section data
const getCurrentData = async (city) => {
  const currDataUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  const response = await fetch(currDataUrl);

  if(!response.ok) {
    throw new Error("Can't fetch data!")
  }
  const currData = await response.json()
  return currData
}

// getting the forecast
const getForecastData = async (city) => {
  const forcastDataUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=${10}&appid=${apiKey}&units=metric`
  const response = await fetch(forcastDataUrl)
  
  if(!response.ok){
    throw new Error("Can't fetch data!")
  }

  const forcastData = await response.json()
  return forcastData
}

// making the forecast dragable
const draggableForecast = () => {
  const forecastContainer = document.getElementById('forecast-container')
  let isDown = false
  let startX;
  let scrollLeft;
  // making the mouse position right
  forecastContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - forecastContainer.offsetLeft;
    scrollLeft = forecastContainer.scrollLeft;
  })
  // safety net (releasing or leaving)
  forecastContainer.addEventListener('mouseup', () => isDown = false)
  forecastContainer.addEventListener('mouseleave', () => isDown = false)
  // now the actual movement for the container
  forecastContainer.addEventListener('mousemove', (e) => {
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX - forecastContainer.offsetLeft;
    const walk = (x - startX)
    forecastContainer.scrollLeft = scrollLeft - walk
  })
}