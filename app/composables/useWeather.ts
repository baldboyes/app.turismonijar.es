import { ref, computed } from 'vue'
import { useI18n } from '#imports'

interface WeatherCurrent {
  time: string
  interval: number
  temperature_2m: number
  relative_humidity_2m: number
  is_day: number
  precipitation: number
  rain: number
  weather_code: number
  wind_speed_10m: number
  wind_direction_10m: number
}

interface WeatherHourly {
  time: string[]
  temperature_2m: number[]
  relative_humidity_2m: number[]
  precipitation_probability: number[]
  rain: number[]
  weather_code: number[]
  wind_speed_10m: number[]
  wind_direction_10m: number[]
  uv_index: number[]
  is_day: number[]
}

interface WeatherDaily {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  sunrise: string[]
  sunset: string[]
  uv_index_max: number[]
  precipitation_probability_max: number[]
  wind_speed_10m_max: number[]
}

interface WeatherData {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current: WeatherCurrent
  hourly: WeatherHourly
  daily: WeatherDaily
}

const wmoIconCode: Record<string, { day: { description: string; image: string }; night: { description: string; image: string } }> = {
  "0": {
    "day": { "description": "weather.sunny", "image": "https://openweathermap.org/img/wn/01d@2x.png" },
    "night": { "description": "weather.clear", "image": "https://openweathermap.org/img/wn/01n@2x.png" }
  },
  "1": {
    "day": { "description": "weather.mainly_sunny", "image": "https://openweathermap.org/img/wn/01d@2x.png" },
    "night": { "description": "weather.mainly_clear", "image": "https://openweathermap.org/img/wn/01n@2x.png" }
  },
  "2": {
    "day": { "description": "weather.partly_cloudy", "image": "https://openweathermap.org/img/wn/02d@2x.png" },
    "night": { "description": "weather.partly_cloudy", "image": "https://openweathermap.org/img/wn/02n@2x.png" }
  },
  "3": {
    "day": { "description": "weather.cloudy", "image": "https://openweathermap.org/img/wn/03d@2x.png" },
    "night": { "description": "weather.cloudy", "image": "https://openweathermap.org/img/wn/03n@2x.png" }
  },
  "45": {
    "day": { "description": "weather.foggy", "image": "https://openweathermap.org/img/wn/50d@2x.png" },
    "night": { "description": "weather.foggy", "image": "https://openweathermap.org/img/wn/50n@2x.png" }
  },
  "48": {
    "day": { "description": "weather.rime_fog", "image": "https://openweathermap.org/img/wn/50d@2x.png" },
    "night": { "description": "weather.rime_fog", "image": "https://openweathermap.org/img/wn/50n@2x.png" }
  },
  "51": {
    "day": { "description": "weather.light_drizzle", "image": "https://openweathermap.org/img/wn/09d@2x.png" },
    "night": { "description": "weather.light_drizzle", "image": "https://openweathermap.org/img/wn/09n@2x.png" }
  },
  "53": {
    "day": { "description": "weather.drizzle", "image": "https://openweathermap.org/img/wn/09d@2x.png" },
    "night": { "description": "weather.drizzle", "image": "https://openweathermap.org/img/wn/09n@2x.png" }
  },
  "55": {
    "day": { "description": "weather.heavy_drizzle", "image": "https://openweathermap.org/img/wn/09d@2x.png" },
    "night": { "description": "weather.heavy_drizzle", "image": "https://openweathermap.org/img/wn/09n@2x.png" }
  },
  "56": {
    "day": { "description": "weather.light_freezing_drizzle", "image": "https://openweathermap.org/img/wn/09d@2x.png" },
    "night": { "description": "weather.light_freezing_drizzle", "image": "https://openweathermap.org/img/wn/09n@2x.png" }
  },
  "57": {
    "day": { "description": "weather.freezing_drizzle", "image": "https://openweathermap.org/img/wn/09d@2x.png" },
    "night": { "description": "weather.freezing_drizzle", "image": "https://openweathermap.org/img/wn/09n@2x.png" }
  },
  "61": {
    "day": { "description": "weather.light_rain", "image": "https://openweathermap.org/img/wn/10d@2x.png" },
    "night": { "description": "weather.light_rain", "image": "https://openweathermap.org/img/wn/10n@2x.png" }
  },
  "63": {
    "day": { "description": "weather.rain", "image": "https://openweathermap.org/img/wn/10d@2x.png" },
    "night": { "description": "weather.rain", "image": "https://openweathermap.org/img/wn/10n@2x.png" }
  },
  "65": {
    "day": { "description": "weather.heavy_rain", "image": "https://openweathermap.org/img/wn/10d@2x.png" },
    "night": { "description": "weather.heavy_rain", "image": "https://openweathermap.org/img/wn/10n@2x.png" }
  },
  "66": {
    "day": { "description": "weather.light_freezing_rain", "image": "https://openweathermap.org/img/wn/10d@2x.png" },
    "night": { "description": "weather.light_freezing_rain", "image": "https://openweathermap.org/img/wn/10n@2x.png" }
  },
  "67": {
    "day": { "description": "weather.freezing_rain", "image": "https://openweathermap.org/img/wn/10d@2x.png" },
    "night": { "description": "weather.freezing_rain", "image": "https://openweathermap.org/img/wn/10n@2x.png" }
  },
  "71": {
    "day": { "description": "weather.light_snow", "image": "https://openweathermap.org/img/wn/13d@2x.png" },
    "night": { "description": "weather.light_snow", "image": "https://openweathermap.org/img/wn/13n@2x.png" }
  },
  "73": {
    "day": { "description": "weather.snow", "image": "https://openweathermap.org/img/wn/13d@2x.png" },
    "night": { "description": "weather.snow", "image": "https://openweathermap.org/img/wn/13n@2x.png" }
  },
  "75": {
    "day": { "description": "weather.heavy_snow", "image": "https://openweathermap.org/img/wn/13d@2x.png" },
    "night": { "description": "weather.heavy_snow", "image": "https://openweathermap.org/img/wn/13n@2x.png" }
  },
  "77": {
    "day": { "description": "weather.snow_grains", "image": "https://openweathermap.org/img/wn/13d@2x.png" },
    "night": { "description": "weather.snow_grains", "image": "https://openweathermap.org/img/wn/13n@2x.png" }
  },
  "80": {
    "day": { "description": "weather.light_showers", "image": "https://openweathermap.org/img/wn/09d@2x.png" },
    "night": { "description": "weather.light_showers", "image": "https://openweathermap.org/img/wn/09n@2x.png" }
  },
  "81": {
    "day": { "description": "weather.showers", "image": "https://openweathermap.org/img/wn/09d@2x.png" },
    "night": { "description": "weather.showers", "image": "https://openweathermap.org/img/wn/09n@2x.png" }
  },
  "82": {
    "day": { "description": "weather.heavy_showers", "image": "https://openweathermap.org/img/wn/09d@2x.png" },
    "night": { "description": "weather.heavy_showers", "image": "https://openweathermap.org/img/wn/09n@2x.png" }
  },
  "85": {
    "day": { "description": "weather.light_snow_showers", "image": "https://openweathermap.org/img/wn/13d@2x.png" },
    "night": { "description": "weather.light_snow_showers", "image": "https://openweathermap.org/img/wn/13n@2x.png" }
  },
  "86": {
    "day": { "description": "weather.snow_showers", "image": "https://openweathermap.org/img/wn/13d@2x.png" },
    "night": { "description": "weather.snow_showers", "image": "https://openweathermap.org/img/wn/13n@2x.png" }
  },
  "95": {
    "day": { "description": "weather.thunderstorm", "image": "https://openweathermap.org/img/wn/11d@2x.png" },
    "night": { "description": "weather.thunderstorm", "image": "https://openweathermap.org/img/wn/11n@2x.png" }
  },
  "96": {
    "day": { "description": "weather.light_thunderstorms_hail", "image": "https://openweathermap.org/img/wn/11d@2x.png" },
    "night": { "description": "weather.light_thunderstorms_hail", "image": "https://openweathermap.org/img/wn/11n@2x.png" }
  },
  "99": {
    "day": { "description": "weather.thunderstorm_hail", "image": "https://openweathermap.org/img/wn/11d@2x.png" },
    "night": { "description": "weather.thunderstorm_hail", "image": "https://openweathermap.org/img/wn/11n@2x.png" }
  }
}

// Module-level shared states
const weatherData = ref<WeatherData | null>(null)
const isLoading = ref(false)
const isError = ref(false)

export function useWeather() {
  const { t } = useI18n()

  async function fetchWeather(force = false) {
    if (weatherData.value && !force) return

    isLoading.value = true
    isError.value = false
    try {
      const response = await fetch('https://baldboy.es/tiempo/datos_meteorologicos.json', { cache: 'no-store' })
      if (!response.ok) throw new Error('Weather API request failed')
      const data = await response.json()
      weatherData.value = data
    } catch (error) {
      console.error('Error al obtener los datos meteorológicos:', error)
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const isDay = computed(() => {
    return weatherData.value?.current.is_day === 1
  })

  const temperature = computed(() => {
    return weatherData.value?.current.temperature_2m ?? 0
  })

  const windSpeed = computed(() => {
    return weatherData.value?.current.wind_speed_10m ?? 0
  })

  const humidity = computed(() => {
    return weatherData.value?.current.relative_humidity_2m ?? 0
  })

  const uv = computed(() => {
    if (!weatherData.value?.daily.uv_index_max?.length) return 0
    return Math.round(weatherData.value.daily.uv_index_max[0])
  })

  const imgTiempo = computed(() => {
    if (!weatherData.value) return null
    const code = weatherData.value.current.weather_code.toString()
    const info = wmoIconCode[code]
    if (!info) return null
    return isDay.value ? info.day.image : info.night.image
  })

  const weatherDescription = computed(() => {
    if (!weatherData.value) return ''
    const code = weatherData.value.current.weather_code.toString()
    const info = wmoIconCode[code]
    if (!info) return ''
    const key = isDay.value ? info.day.description : info.night.description
    return t(key)
  })

  const weatherState = computed<'sunny' | 'cloudy' | 'rainy' | 'snowy'>(() => {
    if (!weatherData.value) return 'sunny'
    const code = weatherData.value.current.weather_code

    if (code === 0 || code === 1) {
      return 'sunny'
    }
    if (code === 2 || code === 3 || code === 45 || code === 48) {
      return 'cloudy'
    }
    if (
      (code >= 51 && code <= 67) ||
      (code >= 80 && code <= 82) ||
      (code >= 95 && code <= 99)
    ) {
      return 'rainy'
    }
    if (
      (code >= 71 && code <= 77) ||
      (code >= 85 && code <= 86)
    ) {
      return 'snowy'
    }
    return 'sunny'
  })

  function getWeatherIcon(code: number, isDayVal: boolean): string {
    const info = wmoIconCode[code.toString()]
    if (!info) return ''
    return isDayVal ? info.day.image : info.night.image
  }

  function getWeatherDescription(code: number, isDayVal: boolean): string {
    const info = wmoIconCode[code.toString()]
    if (!info) return ''
    const key = isDayVal ? info.day.description : info.night.description
    return t(key)
  }

  return {
    weatherData,
    isLoading,
    isError,
    isDay,
    temperature,
    windSpeed,
    humidity,
    uv,
    imgTiempo,
    weatherDescription,
    weatherState,
    fetchWeather,
    getWeatherIcon,
    getWeatherDescription
  }
}

