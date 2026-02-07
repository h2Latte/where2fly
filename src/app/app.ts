import { Component } from '@angular/core';
import { MeteoTableComponent } from './components/meteo-table/meteo-table.component';

@Component({
  selector: 'app-root',
  imports: [MeteoTableComponent],
  template: `<app-meteo-table />`,
})
export class App {}
