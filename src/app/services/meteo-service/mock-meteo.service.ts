import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Site, SiteForecast} from '../../models/meteo.models';
import {AbstractMeteoService} from './abstract-meteo.service';
import {formatDate} from './meteo-utils';

@Injectable()
export class MockMeteoService extends AbstractMeteoService {

  override getForecast(site: Site, startDate?: Date): Observable<SiteForecast> {
    const start = startDate || new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    throw new Error("")

    // return of({
    //   site: {id: site.id, name: site.name, lat:23,lon:34,orientations:  },
    //   days: [
    //     {
    //       date: new Date(start),
    //       label: formatDayLabel(start),
    //       slots: [
    //         {
    //           condition: Condition.Moderate
    //         }
    //       ]
    //     }
    //   ]
    // });
  }
}
