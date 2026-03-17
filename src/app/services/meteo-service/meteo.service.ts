import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Site, SiteForecast, DayForecast, SlotData, WeatherRow } from '../../models/meteo.models';
import { AbstractMeteoService } from './abstract-meteo.service';
import {
  calculateCondition,
  degreesToDirection,
  formatDate,
  formatDayLabel,
  isDirectionFavorable,
  SLOTS
} from './meteo-utils';
import { environment } from '../../../environments/environment';

@Injectable()
export class MeteoService extends AbstractMeteoService {
  private readonly http = inject(HttpClient);

  override getForecast(site: Site, startDate?: Date): Observable<SiteForecast> {
    const start = startDate || new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const params = new URLSearchParams({
      start_date: formatDate(start),
      end_date: formatDate(end)
    });

    const url = `${environment.workerUrl}/forecast/${site.id}?${params}`;

    return this.http.get<WeatherRow[]>(url).pipe(
      map(rows => this.transformResponse(rows, site))
    );
  }

  private transformResponse(rows: WeatherRow[], site: Site): SiteForecast {
    const daysMap = new Map<string, DayForecast>();

    rows.forEach(row => {
      const date = new Date(row.time);
      const hour = date.getHours();

      if (!SLOTS.includes(hour)) return;

      const dayKey = row.time.split('T')[0];

      if (!daysMap.has(dayKey)) {
        daysMap.set(dayKey, {
          date,
          label: formatDayLabel(date),
          slots: []
        });
      }

      const direction = degreesToDirection(row.winddirection_10m);
      const wind = Math.round(row.windspeed_10m);
      const gust = Math.round(row.windgusts_10m);
      const isDirectionOk = isDirectionFavorable(direction, site.orientations);

      const slot: SlotData = {
        time: date,
        wind,
        gust,
        direction,
        directionDeg: row.winddirection_10m,
        temp: Math.round(row.temperature_2m),
        rain: Math.round(row.precipitation * 10) / 10,
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