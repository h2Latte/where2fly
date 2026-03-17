import type { D1Database } from '@cloudflare/workers-types';
import { OpenMeteoResponse, WeatherRow } from './model/meteo.model';

export class WeatherDAO {
    constructor(private readonly db: D1Database) {}

    async getForSite(siteId: string, startDate: string, endDate: string): Promise<WeatherRow[]> {
        const res = await this.db.prepare(`
            SELECT * FROM weather
            WHERE site_id = ? AND time >= ? AND time <= ?
            ORDER BY time ASC
        `).bind(siteId, startDate, endDate).all<WeatherRow>();
        return res.results;
    }

    async insertForecast(siteId: string, forecast: OpenMeteoResponse): Promise<void> {
        const fetched_at = new Date().toISOString();
        const { time, temperature_2m, precipitation, windspeed_10m, windgusts_10m, winddirection_10m } = forecast.hourly;

        const rows: WeatherRow[] = time.map((t, i) => ({
            site_id: siteId,
            time: t,
            fetched_at,
            temperature_2m: temperature_2m[i],
            precipitation: precipitation[i],
            windspeed_10m: windspeed_10m[i],
            windgusts_10m: windgusts_10m[i],
            winddirection_10m: winddirection_10m[i],
        }));

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO weather
                (site_id, time, fetched_at, temperature_2m, precipitation, windspeed_10m, windgusts_10m, winddirection_10m)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        await this.db.batch(
            rows.map(r => stmt.bind(r.site_id, r.time, r.fetched_at, r.temperature_2m, r.precipitation, r.windspeed_10m, r.windgusts_10m, r.winddirection_10m))
        );
    }
}