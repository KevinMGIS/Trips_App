import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import WeatherService from '../lib/weatherService'
import type { WeatherForecast } from '../lib/weatherService'

interface WeatherProps {
  location: string
  className?: string
}

const Weather: React.FC<WeatherProps> = ({ location, className = '' }) => {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (location) {
      loadWeather()
    }
  }, [location])

  const loadWeather = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const weatherData = await WeatherService.getForecast(location)
      if (weatherData) {
        setForecast(weatherData)
      } else {
        setError('Unable to fetch weather data for this location')
      }
    } catch (err) {
      setError('Failed to load weather forecast')
      console.error('Weather error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition: string, isLarge = false) => {
    const size = isLarge ? 'w-8 h-8' : 'w-5 h-5'
    const iconMap: { [key: string]: React.ReactNode } = {
      'Clear': <Sun className={`${size} text-yellow-500`} />,
      'Clouds': <Cloud className={`${size} text-gray-500`} />,
      'Rain': <CloudRain className={`${size} text-blue-500`} />,
      'Drizzle': <CloudRain className={`${size} text-blue-400`} />,
      'Thunderstorm': <CloudLightning className={`${size} text-purple-500`} />,
      'Snow': <CloudSnow className={`${size} text-blue-200`} />,
      'Mist': <Cloud className={`${size} text-gray-400`} />,
      'Fog': <Cloud className={`${size} text-gray-400`} />,
      'Haze': <Cloud className={`${size} text-gray-400`} />
    }
    return iconMap[condition] || <Sun className={`${size} text-yellow-500`} />
  }

  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weather Forecast</h3>
            <p className="text-sm text-gray-500">Loading weather for {location}...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weather Forecast</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
        
        <button 
          onClick={loadWeather}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  if (!forecast) {
    return null
  }

  return (
    <motion.div 
      className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            {getWeatherIcon(forecast.current?.condition || 'Clear')}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Weather Forecast</h3>
            <p className="text-xs text-gray-500">
              {forecast.location}{forecast.country && `, ${forecast.country}`}
            </p>
          </div>
        </div>
        
        <button 
          onClick={loadWeather}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh weather"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Current Weather */}
      {forecast.current && (
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(forecast.current.condition, true)}
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {WeatherService.formatTemp(forecast.current.temp)}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {forecast.current.description}
                </div>
              </div>
            </div>
            
            <div className="text-right text-sm text-gray-600">
              <div>Feels {WeatherService.formatTemp(forecast.current.feels_like)}</div>
              <div>{forecast.current.humidity}% • {forecast.current.wind_speed} mph</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 5-Day Forecast */}
      <div className="grid grid-cols-5 gap-2">
        <AnimatePresence>
          {forecast.forecast.map((day, index) => (
            <motion.div
              key={day.date}
              className="bg-gray-50 rounded-lg p-2 text-center hover:bg-gray-100 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="text-xs font-medium text-gray-700 mb-1">
                {getDayName(day.date)}
              </div>
              
              <div className="flex justify-center mb-1">
                {getWeatherIcon(day.condition)}
              </div>
              
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-gray-900">
                  {WeatherService.formatTemp(day.temp_max)}
                </div>
                <div className="text-xs text-gray-500">
                  {WeatherService.formatTemp(day.temp_min)}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {day.humidity}%
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-3 text-xs text-gray-400 text-center">
        Weather data • Open-Meteo
      </div>
    </motion.div>
  )
}

export default Weather