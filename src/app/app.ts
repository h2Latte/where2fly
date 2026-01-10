import { Component } from '@angular/core';
import { MeteoTableComponent } from './components/meteo-table/meteo-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MeteoTableComponent],
  template: `<app-meteo-table />`,
  styles: []
})
export class App {}
