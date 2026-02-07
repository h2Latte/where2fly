import {Injectable, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Site, SiteForecast, DayForecast, SlotData, OpenMeteoResponse } from '../../models/meteo.models';
import {AbstractMeteoService} from './abstract-meteo.service';
import {
  calculateCondition,
  degreesToDirection,
  formatDate,
  formatDayLabel,
  isDirectionFavorable,
  SLOTS
} from './meteo-utils';

@Injectable()
export class MeteoService extends AbstractMeteoService{
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://api.open-meteo.com/v1/forecast';

  override getForecast(site: Site, startDate?: Date): Observable<SiteForecast> {
    const start = startDate || new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const params: Record<string, string> = {
      latitude: site.lat.toString(),
      longitude: site.lon.toString(),
      hourly: 'temperature_2m,precipitation,windspeed_10m,windgusts_10m,winddirection_10m',
      timezone: 'Europe/Paris',
      start_date: formatDate(start),
      end_date: formatDate(end)
    };

    const url = `${this.API_URL}?${new URLSearchParams(params)}`;

    return this.http.get<OpenMeteoResponse>(url).pipe(
      map(response => this.transformResponse(response, site))
    );
  }

  private transformResponse(response: OpenMeteoResponse, site: Site): SiteForecast {
    const { hourly } = response;
    const daysMap = new Map<string, DayForecast>();

    hourly.time.forEach((timeStr, index) => {
      const date = new Date(timeStr);
      const hour = date.getHours();

      // On ne garde que les créneaux 9h, 12h, 15h
      if (!SLOTS.includes(hour)) return;

      const dayKey = date.toISOString().split('T')[0];

      if (!daysMap.has(dayKey)) {
        daysMap.set(dayKey, {
          date,
          label: formatDayLabel(date),
          slots: []
        });
      }

      const direction = degreesToDirection(hourly.winddirection_10m[index]);
      const wind = Math.round(hourly.windspeed_10m[index]);
      const gust = Math.round(hourly.windgusts_10m[index]);
      const isDirectionOk = isDirectionFavorable(direction, site.orientations);

      const slot: SlotData = {
        time: date,
        wind,
        gust,
        direction,
        directionDeg: hourly.winddirection_10m[index],
        temp: Math.round(hourly.temperature_2m[index]),
        rain: Math.round(hourly.precipitation[index] * 10) / 10,
        isDirectionOk,
        condition: calculateCondition(wind, gust, isDirectionOk, site)
      };

      daysMap.get(dayKey)!.slots.push(slot);
    });

    return {
      site,
      days: Array.from(daysMap.values()).slice(0, 7)
    };
  }
}
