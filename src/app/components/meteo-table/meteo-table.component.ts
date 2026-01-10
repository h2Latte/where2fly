import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MeteoService } from '../../services/meteo.service';
import { Site, SiteForecast } from '../../models/meteo.models';

@Component({
  selector: 'app-meteo-table',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './meteo-table.component.html',
  styleUrl: './meteo-table.component.scss'
})
export class MeteoTableComponent implements OnInit {
  private meteoService = inject(MeteoService);

  // Sites de vol
  sites: Site[] = [
    {
      id: 'lacomte',
      name: 'La Comté',
      lat: 50.433331,
      lon: 2.5,
      orientations: ['O', 'ONO', 'NO', 'NNO'],
      windMin: 13,
      windMax: 25,
    }
    // On ajoutera les autres sites ici
  ];

  forecasts = signal<SiteForecast[]>([]);
  loading = signal<boolean>(true);
  lastUpdate = signal<Date>(new Date());
  weekOffset = signal<number>(0);
  error = signal<string | null>(null);

  // Limite de l'API Open-Meteo : 16 jours max
  readonly maxWeekOffset = 2;

  ngOnInit(): void {
    this.loadForecasts();
  }

  loadForecasts(): void {
    this.loading.set(true);
    this.error.set(null);
    const startDate = this.getStartDate();

    // Charger les prévisions pour chaque site
    this.sites.forEach(site => {
      this.meteoService.getForecast(site, startDate).subscribe({
        next: (forecast) => {
          this.forecasts.update(current => {
            const filtered = current.filter(f => f.site.id !== site.id);
            return [...filtered, forecast];
          });
          this.loading.set(false);
          this.lastUpdate.set(new Date());
        },
        error: (err) => {
          console.error(`Erreur pour ${site.name}:`, err);
          this.loading.set(false);
          const errorMessage = err.error?.reason || err.message || 'Erreur lors du chargement des prévisions';
          this.error.set(errorMessage);
        }
      });
    });
  }

  private getStartDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + (this.weekOffset() * 7));
    return date;
  }

  getWeekLabel(): string {
    const offset = this.weekOffset();
    if (offset === 0) return 'Cette semaine';
    if (offset === 1) return 'Semaine prochaine';
    return `Dans ${offset} semaines`;
  }

  previousWeek(): void {
    if (this.weekOffset() > 0) {
      this.weekOffset.update(v => v - 1);
      this.forecasts.set([]);
      this.loadForecasts();
    }
  }

  nextWeek(): void {
    if (this.weekOffset() < this.maxWeekOffset) {
      this.weekOffset.update(v => v + 1);
      this.forecasts.set([]);
      this.loadForecasts();
    }
  }

  refresh(): void {
    this.forecasts.set([]);
    this.loadForecasts();
  }

  getSlotLabel(index: number): string {
    return ['9h', '12h', '15h'][index];
  }
}
