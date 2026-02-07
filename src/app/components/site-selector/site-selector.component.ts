import {Component, input, output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Site} from '../../models/meteo.models';

@Component({
  selector: 'app-site-selector',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './site-selector.component.html',
  styleUrl: './site-selector.component.scss',
})
export class SiteSelectorComponent {
  sites = input.required<Site[]>();
  selectedSiteIds = input.required<string[]>();
  maxSelectedSites = input.required<number>();
  weekOffset = input.required<number>();
  maxWeekOffset = input.required<number>();

  toggleSite = output<string>();
  previousWeek = output();
  nextWeek = output();

  isSiteSelected(siteId: string): boolean {
    return this.selectedSiteIds().includes(siteId);
  }

  canSelectMore(): boolean {
    return this.selectedSiteIds().length < this.maxSelectedSites();
  }

  getWeekLabel(): string {
    const offset = this.weekOffset();
    if (offset === 0) return 'Cette semaine';
    if (offset === 1) return 'Semaine prochaine';
    return `Dans ${offset} semaines`;
  }
}
