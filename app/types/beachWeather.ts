export interface BeachWeatherCurrent {
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

export interface BeachWeatherHourly {
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

export interface BeachWeatherDaily {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  sunrise: string[]
  sunset: string[]
  uv_index_max: number[]
  precipitation_probability_max: number[]
  wind_speed_10m_max: number[]
}

export interface BeachMarineHourly {
  time: string[]
  sea_surface_temperature: number[]
  wave_height: number[]
  wave_direction: number[]
  wave_period: number[]
}

export interface BeachWeatherItem {
  id: string
  nombre: string
  latitud: number
  longitud: number
  current: BeachWeatherCurrent
  hourly: BeachWeatherHourly
  daily: BeachWeatherDaily
  sea_surface_temperature: number
  marine: {
    hourly: BeachMarineHourly
  }
}

export interface BeachWeatherResponse {
  actualizado: string
  total_playas: number
  playas: Record<string, BeachWeatherItem>
}
