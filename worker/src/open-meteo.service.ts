import { OpenMeteoResponse, Site } from './model/meteo.model';

export class OpenMeteoService {
    private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast';

    // Fetch forecast for a site and return JSON
    async fetchForecast(site: Site, days: number = 14): Promise<OpenMeteoResponse> {
      const params = new URLSearchParams({
            latitude: site.lat.toString(),
            longitude: site.lon.toString(),
            hourly: 'temperature_2m,precipitation,windspeed_10m,windgusts_10m,winddirection_10m',
            timezone: 'Europe/Paris',
            forecast_days: days.toString()
        });

        const res = await fetch(`${this.baseUrl}?${params.toString()}`);
        if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
        return res.json();
    }
}
