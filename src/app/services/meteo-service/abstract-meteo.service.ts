import {Site, SiteForecast} from '../../models/meteo.models';
import {Observable} from 'rxjs';

export abstract class AbstractMeteoService {
  abstract getForecast(site: Site, startDate?: Date): Observable<SiteForecast>;
}
