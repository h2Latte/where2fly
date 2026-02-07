import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {MeteoService} from '../../services/meteo-service/meteo.service';
import {Site, SiteForecast} from '../../models/meteo.models';
import {AbstractMeteoService} from '../../services/meteo-service/abstract-meteo.service';
import {SITES} from '../../models/sites';
import {HeaderComponent} from '../header/header.component';
import {SiteSelectorComponent} from '../site-selector/site-selector.component';
import {SiteMapComponent} from '../site-map/site-map.component';

type ViewMode = 'map' | 'table';

@Component({
  selector: 'app-meteo-table',
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    HeaderComponent,
    SiteSelectorComponent,
    SiteMapComponent,
  ],
  providers: [{
    provide: AbstractMeteoService,
    useClass: MeteoService
  }],
  templateUrl: './meteo-table.component.html',
  styleUrl: './meteo-table.component.scss'
})
export class MeteoTableComponent implements OnInit {
  private readonly meteoService = inject(AbstractMeteoService);

  readonly sites: Site[] = SITES;

  forecasts = signal<SiteForecast[]>([]);
  loading = signal<boolean>(false);
  lastUpdate = signal<Date>(new Date());
  weekOffset = signal<number>(0);
  error = signal<string | null>(null);
  viewMode = signal<ViewMode>('map');

  // Mode carte
  mapDate = signal<string>(this.todayString());
  mapHour = signal<number>(12);

  // Sélection des sites pour le mode tableau (max 3)
  readonly maxSelectedSites = 3;
  private readonly STORAGE_KEY = 'razmotte_selected_sites';
  selectedSiteIds = signal<string[]>(this.loadSelectedFromStorage());

  selectedSites = computed(() =>
    this.sites.filter(s => this.selectedSiteIds().includes(s.id))
  );

  readonly maxWeekOffset = 2;

  ngOnInit(): void {
    if (this.viewMode() === 'map') {
      this.loadMapForecasts();
    } else if (this.selectedSiteIds().length > 0) {
      this.loadForecasts();
    }
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    if (mode === 'table' && this.selectedSiteIds().length > 0) {
      this.forecasts.set([]);
      this.loadForecasts();
    }
    if (mode === 'map') {
      this.forecasts.set([]);
      this.loadMapForecasts();
    }
  }

  // --- Mode carte ---

  loadMapForecasts(): void {
    const date = new Date(this.mapDate());
    this.loading.set(true);
    this.error.set(null);
    this.forecasts.set([]);

    const requests = this.sites.map(site => this.meteoService.getForecast(site, date));

    forkJoin(requests).subscribe({
      next: (results) => {
        this.forecasts.set(results);
        this.loading.set(false);
        this.lastUpdate.set(new Date());
      },
      error: (err) => {
        console.error('Erreur chargement carte:', err);
        this.loading.set(false);
        this.error.set(err.error?.reason || err.message || 'Erreur lors du chargement');
      }
    });
  }

  onMapDateChange(date: string): void {
    this.mapDate.set(date);
    this.loadMapForecasts();
  }

  onMapHourChange(hour: number): void {
    this.mapHour.set(hour);
  }

  // --- Mode tableau ---

  toggleSite(siteId: string): void {
    const current = this.selectedSiteIds();
    if (current.includes(siteId)) {
      this.selectedSiteIds.set(current.filter(id => id !== siteId));
    } else if (current.length < this.maxSelectedSites) {
      this.selectedSiteIds.set([...current, siteId]);
    }
    this.saveSelectedToStorage();

    if (this.selectedSiteIds().length > 0) {
      this.forecasts.set([]);
      this.loadForecasts();
    } else {
      this.forecasts.set([]);
    }
  }

  loadForecasts(): void {
    const sitesToLoad = this.selectedSites();
    if (sitesToLoad.length === 0) return;

    this.loading.set(true);
    this.error.set(null);
    const startDate = this.getStartDate();

    sitesToLoad.forEach(site => {
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
          this.error.set(err.error?.reason || err.message || 'Erreur lors du chargement');
        }
      });
    });
  }

  // --- Navigation ---

  previousWeek(): void {
    if (this.weekOffset() > 0) {
      this.weekOffset.update(v => v - 1);
      this.forecasts.set([]);
      if (this.viewMode() === 'table') this.loadForecasts();
    }
  }

  nextWeek(): void {
    if (this.weekOffset() < this.maxWeekOffset) {
      this.weekOffset.update(v => v + 1);
      this.forecasts.set([]);
      if (this.viewMode() === 'table') this.loadForecasts();
    }
  }

  refresh(): void {
    this.forecasts.set([]);
    if (this.viewMode() === 'table') this.loadForecasts();
  }

  getSlotLabel(index: number): string {
    return ['9h', '12h', '15h'][index];
  }

  private getStartDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + (this.weekOffset() * 7));
    return date;
  }

  private loadSelectedFromStorage(): string[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return (JSON.parse(stored) as string[]).slice(0, this.maxSelectedSites);
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveSelectedToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.selectedSiteIds()));
  }

  private todayString(): string {
    return new Date().toISOString().split('T')[0];
  }
}
