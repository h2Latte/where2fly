import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MeteoService} from '../../services/meteo-service/meteo.service';
import {Site, SiteForecast} from '../../models/meteo.models';
import {AbstractMeteoService} from '../../services/meteo-service/abstract-meteo.service';
import {SITES} from '../../models/sites';
import {HeaderComponent} from '../header/header.component';
import {SiteSelectorComponent} from '../site-selector/site-selector.component';

@Component({
  selector: 'app-meteo-table',
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    HeaderComponent,
    SiteSelectorComponent,
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

  sites: Site[] = SITES;

  forecasts = signal<SiteForecast[]>([]);
  loading = signal<boolean>(false);
  lastUpdate = signal<Date>(new Date());
  weekOffset = signal<number>(0);
  error = signal<string | null>(null);

  // Sélection des sites (max 3)
  readonly maxSelectedSites = 3;
  private readonly STORAGE_KEY = 'razmotte_selected_sites';
  selectedSiteIds = signal<string[]>(this.loadSelectedFromStorage());

  // Sites sélectionnés
  selectedSites = computed(() =>
    this.sites.filter(s => this.selectedSiteIds().includes(s.id))
  );

  // Limite de l'API Open-Meteo : 16 jours max
  readonly maxWeekOffset = 2;

  ngOnInit(): void {
    if (this.selectedSiteIds().length > 0) {
      this.loadForecasts();
    }
  }

  private loadSelectedFromStorage(): string[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const ids = JSON.parse(stored) as string[];
        return ids.slice(0, this.maxSelectedSites);
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveSelectedToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.selectedSiteIds()));
  }

  toggleSite(siteId: string): void {
    const current = this.selectedSiteIds();
    if (current.includes(siteId)) {
      // Désélectionner
      this.selectedSiteIds.set(current.filter(id => id !== siteId));
    } else if (current.length < this.maxSelectedSites) {
      // Sélectionner si pas au max
      this.selectedSiteIds.set([...current, siteId]);
    }
    this.saveSelectedToStorage();

    // Recharger les prévisions si on a des sites sélectionnés
    if (this.selectedSiteIds().length > 0) {
      this.forecasts.set([]);
      this.loadForecasts();
    } else {
      this.forecasts.set([]);
    }
  }

  loadForecasts(): void {
    const sitesToLoad = this.selectedSites();
    if (sitesToLoad.length === 0) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const startDate = this.getStartDate();

    // Charger les prévisions pour les sites sélectionnés uniquement
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
