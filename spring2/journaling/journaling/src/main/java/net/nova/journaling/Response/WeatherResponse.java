package net.nova.journaling.Response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherResponse {
    private Current current;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Current {
        private double feelslike;
    }
}