export interface Site {
  id: string;
  name: string;
  lat: number;
  lon: number;
  orientations: Direction[];  // Directions de vent favorables
  windMin: number;         // Vent min acceptable (km/h)
  windMax: number;         // Vent max acceptable (km/h)
}

export interface SlotData {
  time: Date;
  wind: number;           // Vent moyen km/h
  gust: number;           // Rafales km/h
  direction: Direction;      // Direction du vent (N, NNE, NE, etc.)
  directionDeg: number;   // Direction en degrés
  temp: number;           // Température °C
  rain: number;           // Précipitations mm
  isDirectionOk: boolean; // Direction favorable pour le site
  condition: Condition;
}

export enum Direction {
  N = 'N', NNE = 'NNE', NE = 'NE', ENE = 'ENE', E = 'E', ESE = 'ESE', SE = 'SE', SSE = 'SSE',
  S = 'S', SSO = 'SSO', SO = 'SO', OSO = 'OSO', O = 'O', ONO = 'ONO', NO = 'NO', NNO = 'NNO'
}

export enum Condition {
  Good = 'good',
  Moderate = 'moderate',
  Bad = 'bad',
  Closed = 'closed'
}

export interface DayForecast {
  date: Date;
  label: string;          // "Sam 10"
  slots: SlotData[];      // 3 créneaux : 9h, 12h, 15h
}

export interface SiteForecast {
  site: Site;
  days: DayForecast[];
}

// Réponse de l'API Open-Meteo
export interface OpenMeteoResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    windspeed_10m: number[];
    windgusts_10m: number[];
    winddirection_10m: number[];
  };
}
