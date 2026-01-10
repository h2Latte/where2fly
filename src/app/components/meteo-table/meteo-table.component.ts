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
  private readonly meteoService = inject(MeteoService);

  // Sites de vol du Nord-Pas-de-Calais
  sites: Site[] = [
    {
      id: 'olhain',
      name: 'Olhain',
      lat: 50.4343,
      lon: 2.586,
      orientations: ['SSO', 'S'],
      windMin: 13,
      windMax: 23,
    },
    {
      id: 'lacomte',
      name: 'La Comté',
      lat: 50.433331,
      lon: 2.5,
      orientations: ['O', 'ONO', 'NO', 'NNO'],
      windMin: 13,
      windMax: 25,
    },
    {
      id: 'licques',
      name: 'Licques',
      lat: 50.7855,
      lon: 1.9355,
      orientations: ['SSE', 'S', 'SSO'],
      windMin: 13,
      windMax: 22,
    },
    {
      id: 'equihen',
      name: 'Equihen',
      lat: 50.6796,
      lon: 1.567,
      orientations: ['OSO', 'O'],
      windMin: 15,
      windMax: 30,
    },
    {
      id: 'parcdesiles',
      name: 'Parc des Iles',
      lat: 50.4014,
      lon: 2.9342,
      orientations: ['SE', 'S'],
      windMin: 13,
      windMax: 25,
    },
    {
      id: 'montsainteloi',
      name: 'Mont Saint Eloi',
      lat: 50.3311,
      lon: 2.6632,
      orientations: ['NE', 'SO'],
      windMin: 13,
      windMax: 25,
    },
    {
      id: 'zuydcoote',
      name: 'Zuydcoote',
      lat: 51.0692,
      lon: 2.4703,
      orientations: ['O', 'NO', 'N'],
      windMin: 15,
      windMax: 30,
    },
    {
      id: 'wissant',
      name: 'Dune de Wissant',
      lat: 50.8833,
      lon: 1.6667,
      orientations: ['O', 'SO', 'NO', 'N', 'NE'],
      windMin: 15,
      windMax: 30,
    },
    {
      id: 'sangatte',
      name: 'Sangatte',
      lat: 50.9412,
      lon: 1.7378,
      orientations: ['NO'],
      windMin: 15,
      windMax: 30,
    },
    {
      id: 'escalles',
      name: 'Escalles',
      lat: 50.9167,
      lon: 1.7167,
      orientations: ['O', 'NO'],
      windMin: 15,
      windMax: 30,
    },
    {
      id: 'frencq',
      name: 'Frencq',
      lat: 50.5605,
      lon: 1.6662,
      orientations: ['NE'],
      windMin: 13,
      windMax: 25,
    },
    {
      id: 'cranauxoeufs',
      name: 'Cran aux Oeufs',
      lat: 50.8472,
      lon: 1.5833,
      orientations: ['SSE', 'S', 'SSO'],
      windMin: 13,
      windMax: 25,
    },
    {
      id: 'lacreche',
      name: 'La Crèche',
      lat: 50.7511,
      lon: 1.5972,
      orientations: ['NO', 'O'],
      windMin: 15,
      windMax: 30,
    },
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
