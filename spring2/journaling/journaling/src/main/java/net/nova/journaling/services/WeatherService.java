package net.nova.journaling.services;


import net.nova.journaling.Response.WeatherResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {

    private static final String API_KEY = "your_weather_api_key_here";
    private static final String BASE_URL = "http://api.weatherapi.com/v1/current.json";

    public WeatherResponse getWeather(String city) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = BASE_URL + "?key=" + API_KEY + "&q=" + city;
            return restTemplate.getForObject(url, WeatherResponse.class);
        } catch (Exception e) {
            // Return a mock response for demo purposes
            return new WeatherResponse(new WeatherResponse.Current(25.0));
        }
    }
}