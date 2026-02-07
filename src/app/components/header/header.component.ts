import {Component, input, output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, DatePipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  weekOffset = input.required<number>();
  maxWeekOffset = input.required<number>();
  lastUpdate = input.required<Date>();

  previousWeek = output();
  nextWeek = output();
  refresh = output();

  getWeekLabel(): string {
    const offset = this.weekOffset();
    if (offset === 0) return 'Cette semaine';
    if (offset === 1) return 'Semaine prochaine';
    return `Dans ${offset} semaines`;
  }
}
