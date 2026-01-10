import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Site, SiteForecast, DayForecast, SlotData, OpenMeteoResponse } from '../models/meteo.models';

@Injectable({
  providedIn: 'root'
})
export class MeteoService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://api.open-meteo.com/v1/forecast';

  // Créneaux horaires qu'on veut afficher
  private readonly SLOTS = [9, 12, 15];

  // Conversion degrés -> direction cardinale
  private readonly DIRECTIONS = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'
  ];

  getForecast(site: Site, startDate?: Date): Observable<SiteForecast> {
    const start = startDate || new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const params: Record<string, string> = {
      latitude: site.lat.toString(),
      longitude: site.lon.toString(),
      hourly: 'temperature_2m,precipitation,windspeed_10m,windgusts_10m,winddirection_10m',
      timezone: 'Europe/Paris',
      start_date: this.formatDate(start),
      end_date: this.formatDate(end)
    };

    const url = `${this.API_URL}?${new URLSearchParams(params)}`;

    return this.http.get<OpenMeteoResponse>(url).pipe(
      map(response => this.transformResponse(response, site))
    );
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private transformResponse(response: OpenMeteoResponse, site: Site): SiteForecast {
    const { hourly } = response;
    const daysMap = new Map<string, DayForecast>();

    hourly.time.forEach((timeStr, index) => {
      const date = new Date(timeStr);
      const hour = date.getHours();

      // On ne garde que les créneaux 9h, 12h, 15h
      if (!this.SLOTS.includes(hour)) return;

      const dayKey = date.toISOString().split('T')[0];

      if (!daysMap.has(dayKey)) {
        daysMap.set(dayKey, {
          date,
          label: this.formatDayLabel(date),
          slots: []
        });
      }

      const direction = this.degreesToDirection(hourly.winddirection_10m[index]);
      const wind = Math.round(hourly.windspeed_10m[index]);
      const gust = Math.round(hourly.windgusts_10m[index]);
      const isDirectionOk = this.isDirectionFavorable(direction, site.orientations);

      const slot: SlotData = {
        time: date,
        wind,
        gust,
        direction,
        directionDeg: hourly.winddirection_10m[index],
        temp: Math.round(hourly.temperature_2m[index]),
        rain: Math.round(hourly.precipitation[index] * 10) / 10,
        isDirectionOk,
        condition: this.calculateCondition(wind, gust, isDirectionOk, site)
      };

      daysMap.get(dayKey)!.slots.push(slot);
    });

    return {
      site,
      days: Array.from(daysMap.values()).slice(0, 7)
    };
  }

  private degreesToDirection(degrees: number): string {
    const index = Math.round(degrees / 22.5) % 16;
    return this.DIRECTIONS[index];
  }

  private isDirectionFavorable(direction: string, favorableDirections: string[]): boolean {
    return favorableDirections.includes(direction);
  }

  private calculateCondition(
    wind: number,
    gust: number,
    isDirectionOk: boolean,
    site: Site
  ): 'good' | 'moderate' | 'bad' {
    // Mauvaise direction = bad
    if (!isDirectionOk) return 'bad';

    // Vent dans la plage idéale et rafales pas trop fortes
    if (wind >= site.windMin && wind <= site.windMax && gust <= site.windMax + 15) {
      return 'good';
    }

    // Vent un peu hors plage mais acceptable
    if (wind <= site.windMax + 10 && gust <= site.windMax + 25) {
      return 'moderate';
    }

    return 'bad';
  }

  private formatDayLabel(date: Date): string {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return `${days[date.getDay()]} ${date.getDate()}`;
  }
}
