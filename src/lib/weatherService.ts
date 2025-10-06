// Weather Service for fetching weather data from OpenWeatherMap API
import { supabase } from './supabase'

export interface WeatherDay {
  date: string
  temp_max: number
  temp_min: number
  temp_day: number
  condition: string
  description: string
  icon: string
  humidity: number
  wind_speed: number
  feels_like: number
}

export interface WeatherForecast {
  location: string
  country: string
  forecast: WeatherDay[]
  current?: {
    temp: number
    condition: string
    description: string
    icon: string
    humidity: number
    wind_speed: number
    feels_like: number
  }
}

export interface Coordinates {
  lat: number
  lon: number
}

class WeatherService {
  private static apiKey = import.meta.env.VITE_WEATHER_API_KEY
  private static provider = import.meta.env.VITE_WEATHER_PROVIDER || 'open-meteo' // 'open-meteo' or 'openweathermap'

  // Get coordinates from location name using free geocoding service
  static async getCoordinates(location: string): Promise<Coordinates | null> {
    try {
      // Use Nominatim (OpenStreetMap) free geocoding service
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      
      const response = await fetch(geocodeUrl, {
        headers: {
          'User-Agent': 'TripPlannerApp/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`)
      }

      const data = await response.json()
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        }
      }
      
      return null
    } catch (error) {
      console.error('Error getting coordinates:', error)
      return null
    }
  }

  // Fetch 5-day weather forecast
  static async getForecast(location: string): Promise<WeatherForecast | null> {
    try {
      // First check cache
      const cached = await this.getCachedWeather(location)
      if (cached && this.isCacheValid(cached.expires_at)) {
        return this.parseWeatherData(cached.weather_data, location)
      }

      // Get coordinates for the location
      const coords = await this.getCoordinates(location)
      if (!coords) {
        console.warn(`Could not find coordinates for location: ${location}`)
        return null
      }

      let weatherData: any

      if (this.provider === 'openweathermap' && this.apiKey) {
        // Use OpenWeatherMap (requires API key)
        weatherData = await this.fetchOpenWeatherMapData(coords, location)
      } else {
        // Use Open-Meteo (free, no API key required)
        weatherData = await this.fetchOpenMeteoData(coords, location)
      }

      if (!weatherData) {
        return null
      }

      // Cache the data
      await this.cacheWeatherData(location, weatherData)

      return this.parseWeatherData(weatherData, location)
    } catch (error) {
      console.error('Error fetching weather:', error)
      return null
    }
  }

  // Fetch data from OpenWeatherMap (requires API key)
  private static async fetchOpenWeatherMapData(coords: Coordinates, location: string): Promise<any> {
    const baseUrl = 'https://api.openweathermap.org/data/2.5'
    
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`${baseUrl}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=imperial`),
      fetch(`${baseUrl}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=imperial`)
    ])

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('OpenWeatherMap API request failed')
    }

    const [currentData, forecastData] = await Promise.all([
      currentResponse.json(),
      forecastResponse.json()
    ])

    return {
      provider: 'openweathermap',
      current: currentData,
      forecast: forecastData,
      location: location,
      fetched_at: new Date().toISOString()
    }
  }

  // Fetch data from Open-Meteo (free, no API key required)
  private static async fetchOpenMeteoData(coords: Coordinates, location: string): Promise<any> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto&forecast_days=6&temperature_unit=fahrenheit&wind_speed_unit=mph`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Open-Meteo API request failed')
    }

    const data = await response.json()

    return {
      provider: 'open-meteo',
      data: data,
      location: location,
      fetched_at: new Date().toISOString()
    }
  }

  // Parse weather API response into our format
  private static parseWeatherData(apiData: any, location: string): WeatherForecast {
    if (apiData.provider === 'open-meteo') {
      return this.parseOpenMeteoData(apiData, location)
    } else {
      return this.parseOpenWeatherMapData(apiData, location)
    }
  }

  // Parse Open-Meteo API response
  private static parseOpenMeteoData(apiData: any, location: string): WeatherForecast {
    const data = apiData.data
    const forecast: WeatherDay[] = []

    // Map weather codes to conditions
    const getConditionFromCode = (code: number): { condition: string, description: string } => {
      if (code === 0) return { condition: 'Clear', description: 'clear sky' }
      if (code <= 3) return { condition: 'Clouds', description: 'partly cloudy' }
      if (code <= 48) return { condition: 'Mist', description: 'fog' }
      if (code <= 67) return { condition: 'Rain', description: 'rain' }
      if (code <= 77) return { condition: 'Snow', description: 'snow' }
      if (code <= 82) return { condition: 'Rain', description: 'rain showers' }
      if (code <= 86) return { condition: 'Snow', description: 'snow showers' }
      if (code <= 99) return { condition: 'Thunderstorm', description: 'thunderstorm' }
      return { condition: 'Clear', description: 'clear' }
    }

    // Process daily forecasts (skip today, take next 5 days)
    for (let i = 1; i <= 5 && i < data.daily.time.length; i++) {
      const weatherInfo = getConditionFromCode(data.daily.weather_code[i])
      
      forecast.push({
        date: data.daily.time[i],
        temp_max: Math.round(data.daily.temperature_2m_max[i]),
        temp_min: Math.round(data.daily.temperature_2m_min[i]),
        temp_day: Math.round((data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2),
        condition: weatherInfo.condition,
        description: weatherInfo.description,
        icon: this.getOpenMeteoIcon(data.daily.weather_code[i]),
        humidity: Math.round(data.daily.relative_humidity_2m_mean[i] || 50),
        wind_speed: Math.round(data.daily.wind_speed_10m_max[i] || 0),
        feels_like: Math.round(data.daily.temperature_2m_max[i]) // Approximation
      })
    }

    const result: WeatherForecast = {
      location: location,
      country: '',
      forecast
    }

    // Add current weather if available
    if (data.current) {
      const currentWeather = getConditionFromCode(data.current.weather_code)
      result.current = {
        temp: Math.round(data.current.temperature_2m),
        condition: currentWeather.condition,
        description: currentWeather.description,
        icon: this.getOpenMeteoIcon(data.current.weather_code),
        humidity: Math.round(data.current.relative_humidity_2m),
        wind_speed: Math.round(data.current.wind_speed_10m),
        feels_like: Math.round(data.current.temperature_2m) // Open-Meteo doesn't provide feels_like
      }
    }

    return result
  }

  // Parse OpenWeatherMap API response
  private static parseOpenWeatherMapData(apiData: any, location: string): WeatherForecast {
    const forecast: WeatherDay[] = []
    
    // Group forecast data by date and take one reading per day (around noon)
    const dailyData = new Map<string, any>()
    
    if (apiData.forecast && apiData.forecast.list) {
      apiData.forecast.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000)
        const dateStr = date.toISOString().split('T')[0]
        const hour = date.getHours()
        
        // Prefer readings around noon (12:00) for daily forecast
        if (!dailyData.has(dateStr) || Math.abs(hour - 12) < Math.abs(dailyData.get(dateStr).hour - 12)) {
          dailyData.set(dateStr, { ...item, hour })
        }
      })

      // Convert to our format and limit to 5 days
      Array.from(dailyData.entries())
        .slice(0, 5)
        .forEach(([date, item]) => {
          forecast.push({
            date,
            temp_max: Math.round(item.main.temp_max),
            temp_min: Math.round(item.main.temp_min),
            temp_day: Math.round(item.main.temp),
            condition: item.weather[0].main,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            wind_speed: Math.round(item.wind.speed), // Already in mph from API
            feels_like: Math.round(item.main.feels_like)
          })
        })
    }

    const result: WeatherForecast = {
      location: apiData.current?.name || location,
      country: apiData.current?.sys?.country || '',
      forecast
    }

    // Add current weather if available
    if (apiData.current) {
      result.current = {
        temp: Math.round(apiData.current.main.temp),
        condition: apiData.current.weather[0].main,
        description: apiData.current.weather[0].description,
        icon: apiData.current.weather[0].icon,
        humidity: apiData.current.main.humidity,
        wind_speed: Math.round(apiData.current.wind.speed),
        feels_like: Math.round(apiData.current.main.feels_like)
      }
    }

    return result
  }

  // Cache weather data in Supabase
  private static async cacheWeatherData(location: string, weatherData: any): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // Cache for 1 hour

      await supabase
        .from('weather_cache')
        .upsert({
          location: location.toLowerCase(),
          weather_data: weatherData,
          api_provider: weatherData.provider || 'open-meteo',
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'location'
        })
    } catch (error) {
      console.error('Error caching weather data:', error)
    }
  }

  // Get cached weather data
  private static async getCachedWeather(location: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('location', location.toLowerCase())
        .single()

      if (error || !data) {
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching cached weather:', error)
      return null
    }
  }

  // Check if cached data is still valid
  private static isCacheValid(expiresAt: string): boolean {
    return new Date(expiresAt) > new Date()
  }

  // Get weather icon URL (for OpenWeatherMap)
  static getIconUrl(iconCode: string): string {
    if (iconCode.includes('d') || iconCode.includes('n')) {
      // OpenWeatherMap icon
      return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    }
    // Generic icon for Open-Meteo
    return ''
  }

  // Get icon code for Open-Meteo weather codes
  private static getOpenMeteoIcon(code: number): string {
    if (code === 0) return '01d' // clear
    if (code <= 3) return '03d' // cloudy
    if (code <= 48) return '50d' // mist/fog
    if (code <= 67) return '10d' // rain
    if (code <= 77) return '13d' // snow
    if (code <= 82) return '09d' // showers
    if (code <= 86) return '13d' // snow showers
    if (code <= 99) return '11d' // thunderstorm
    return '01d'
  }

  // Format temperature with unit
  static formatTemp(temp: number): string {
    return `${temp}°F`
  }

  // Get weather emoji based on condition
  static getWeatherEmoji(condition: string): string {
    const emojiMap: { [key: string]: string } = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '🌨️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️'
    }
    return emojiMap[condition] || '🌤️'
  }
}

export default WeatherService