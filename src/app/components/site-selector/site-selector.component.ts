import {Component, input, output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {Site} from '../../models/meteo.models';

@Component({
  selector: 'app-site-selector',
  imports: [MatIconModule],
  templateUrl: './site-selector.component.html',
})
export class SiteSelectorComponent {
  sites = input.required<Site[]>();
  selectedSiteIds = input.required<string[]>();
  maxSelectedSites = input.required<number>();

  toggleSite = output<string>();

  isSiteSelected(siteId: string): boolean {
    return this.selectedSiteIds().includes(siteId);
  }

  canSelectMore(): boolean {
    return this.selectedSiteIds().length < this.maxSelectedSites();
  }
}
