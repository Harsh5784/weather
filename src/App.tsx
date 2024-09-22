import { useState } from "react";
import './App.css'; // Import the CSS file
import axios from "axios";
import coldImage from './assets/cold.png'; // Image for cold temperatures
import hotImage from './assets/moderate.png'; // Image for moderate temperatures
import moderateImage from './assets/high.png'; // Image for hot temperatures
import humidityIcon from './assets/humidity.png'; // Humidity icon
import windIcon from './assets/wspeed.png'; // Wind speed icon

interface AirQuality {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
}

const App = () => {
  const [location, setLocation] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>(""); // State for input value
  const [suggestions, setSuggestions] = useState<string[]>([]); // State for city suggestions
  const [temperature, setTemperature] = useState<number | null>(null);
  const [feelsLike, setFeelsLike] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [windSpeed, setWindSpeed] = useState<number | null>(null);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    // Fetch city suggestions based on user input
    if (value) {
      try {
        const apiKey = "d27c629e44564928a67190908242009"; // Replace with your actual API key
        const response = await axios.get(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${value}`);
        setSuggestions(response.data.map((city: any) => city.name)); // Assuming response has a 'name' property
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
      }
    } else {
      setSuggestions([]); // Clear suggestions if input is empty
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const loc = inputValue; // Use the state for the location
    setLocation(loc);
    setSuggestions([]); // Clear suggestions on form submission

    const apiKey = "d27c629e44564928a67190908242009"; // Replace with your actual API key
    const baseUrl = "https://api.weatherapi.com/v1/current.json";

    axios.get(`${baseUrl}?key=${apiKey}&q=${loc}&aqi=yes`)
      .then((response) => {
        const data = response.data;

        if (data && data.current) {
          setTemperature(data.current.temp_c);
          setFeelsLike(data.current.feelslike_c);
          setHumidity(data.current.humidity);
          setWindSpeed(data.current.wind_kph);
          setAirQuality(data.current.air_quality || null);
          setError(null);
        } 
      })
      .catch((error) => {
        setTemperature(null);
        setFeelsLike(null);
        setHumidity(null);
        setWindSpeed(null);
        setAirQuality(null);
        setError(error.response ? error.response.data : error.message);
      });
  };

  const getTemperatureImage = (temp: number | null) => {
    if (temp === null) return null;

    if (temp < 10) {
      return coldImage; // Cold temperature image
    } else if (temp >= 10 && temp < 25) {
      return moderateImage; // Moderate temperature image
    } else {
      return hotImage; // Hot temperature image
    }
  };

  return (
    <div className="app-container">
      
      <div className="welcome-message">
          <h2>Welcome to Apna Weather!</h2>
          <p>Enter a location to get the current weather information and air quality data.</p>
          <p>Type a correct city name and select from the suggestions to get started.</p>
        </div>
      <form className="weather-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="text" 
            id="location" 
            name="location" 
            placeholder="Enter location" 
            required 
            value={inputValue} // Controlled input
            onChange={handleInputChange} // Update input value on change
            className="location-input"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  onClick={() => handleSuggestionClick(suggestion)} 
                  className="suggestion-item"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-group">
          <button type="submit" className="submit-button">Get Weather</button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>

      {temperature !== null && (
        <div className="weather-info">
          <h2 className="location-title">City : {location}</h2>
          <div className="temperature-info">
            <img 
              src={getTemperatureImage(temperature) || ''} 
              alt="Temperature" 
              className="temperature-icon" 
            />
            <div>
              <p>Temperature: {temperature} °C</p>
              <p>Feels Like: {feelsLike} °C</p>
            </div>
          </div>
          <div className="info-container">
            <div className="info-item">
              <img src={humidityIcon} alt="Humidity" className="info-icon" />
              <span>Humidity: {humidity} %</span>
            </div>
            <div className="info-item">
              <img src={windIcon} alt="Wind Speed" className="info-icon" />
              <span>Wind Speed: {windSpeed} kph</span>
            </div>
          </div>
          {airQuality && (
            <div className="air-quality">
              <h3>Air Quality</h3>
              <p>CO: {airQuality.co}</p>
              <p>NO2: {airQuality.no2}</p>
              <p>O3: {airQuality.o3}</p>
              <p>SO2: {airQuality.so2}</p>
              <p>PM2.5: {airQuality.pm2_5}</p>
              <p>PM10: {airQuality.pm10}</p>
            </div>
          )}
        </div>
      )}
      <footer className="footer">
        <p>&copy; 2024 Apna Weather</p>
      </footer>
    </div>
  );
};

export default App;
