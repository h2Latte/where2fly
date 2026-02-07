import {Component, input, output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, DatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  lastUpdate = input.required<Date>();

  refresh = output();
}
