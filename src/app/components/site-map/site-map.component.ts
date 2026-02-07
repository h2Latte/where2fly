import {
  Component,
  afterNextRender,
  effect,
  input,
} from '@angular/core';
import * as L from 'leaflet';
import {Condition, Site, SiteForecast} from '../../models/meteo.models';

@Component({
  selector: 'app-site-map',
  templateUrl: './site-map.component.html',
  styleUrl: './site-map.component.scss',
})
export class SiteMapComponent {
  sites = input.required<Site[]>();
  forecasts = input.required<SiteForecast[]>();
  selectedHour = input<number>(12);

  private map!: L.Map;
  private readonly markers = new Map<string, L.Marker>();

  static readonly ICONS = {
    gray: L.icon({iconUrl: 'marker-gray.svg', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]}),
    green: L.icon({iconUrl: 'marker-green.svg', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]}),
    red: L.icon({iconUrl: 'marker-red.svg', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]}),
  };

  constructor() {
    afterNextRender(() => this.initMap());
    effect(() => this.updateMarkerColors());
  }

  private initMap(): void {
    this.map = L.map('mapContainer').setView([46.8, 2.5], 6);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    setTimeout(() => this.map.invalidateSize(), 200);
    this.createMarkers();
  }

  private buildSitePopup(site: Site): string {
    const orientations = site.orientations.join(' ');
    return `
      <div class="site-popup">
        <strong class="site-popup-name">${site.name}</strong>
        <div class="site-popup-orientations">${orientations}</div>
        <div class="site-popup-wind">${site.windMin}–${site.windMax} km/h</div>
      </div>
    `;
  }

  private updateMarkerColors(): void {
    const forecasts = this.forecasts();
    const hour = this.selectedHour();
    if (!this.map) return;

    for (const [siteId, marker] of this.markers) {
      const forecast = forecasts.find(f => f.site.id === siteId);
      if (!forecast) {
        marker.setIcon(SiteMapComponent.ICONS.gray);
        continue;
      }

      // Chercher le slot correspondant à l'heure sélectionnée dans le 1er jour
      const day = forecast.days[0];
      const slot = day?.slots.find(s => s.time.getHours() === hour);

      if (!slot) {
        marker.setIcon(SiteMapComponent.ICONS.gray);
      } else if (slot.condition === Condition.Good) {
        marker.setIcon(SiteMapComponent.ICONS.green);
      } else {
        marker.setIcon(SiteMapComponent.ICONS.red);
      }
    }
  }

  private createMarkers(): void {
    for (const site of this.sites()) {
      const marker = L.marker([site.lat, site.lon], {icon: SiteMapComponent.ICONS.gray})
        .bindPopup(this.buildSitePopup(site))
        .addTo(this.map);

      this.markers.set(site.id, marker);
    }
  }
}
