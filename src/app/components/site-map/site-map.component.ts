import {
  Component,
  afterNextRender,
  input,
} from '@angular/core';
import * as L from 'leaflet';
import {Site, SiteForecast} from '../../models/meteo.models';

@Component({
  selector: 'app-site-map',
  templateUrl: './site-map.component.html',
  styleUrl: './site-map.component.scss',
})
export class SiteMapComponent {
  sites = input.required<Site[]>();
  forecasts = input.required<SiteForecast[]>();

  private map!: L.Map;
  private readonly markers = new Map<string, L.Marker>();

  constructor() {
    afterNextRender(() => this.initMap());
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

  private createMarkers(): void {
    for (const site of this.sites()) {
      const marker = L.marker([site.lat, site.lon])
        .bindPopup(this.buildSitePopup(site))
        .addTo(this.map);

      this.markers.set(site.id, marker);
    }
  }
}
