export enum Direction {
    N = 'N', NE = 'NE', E = 'E', SE = 'SE', S = 'S', SO = 'SO', O = 'O', NO = 'NO',
    NNO = 'NNO', SSO = 'SSO', SSE = 'SSE', OSO = 'OSO', ONO = 'ONO'
}

export interface Site {
    id: string;
    name: string;
    lat: number;
    lon: number;
    orientations: Direction[];
    windMin: number;
    windMax: number;
}

export interface OpenMeteoHourly {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    windspeed_10m: number[];
    windgusts_10m: number[];
    winddirection_10m: number[];
}

export interface OpenMeteoHourlyUnits {
    time: string;
    temperature_2m: string;
    precipitation: string;
    windspeed_10m: string;
    windgusts_10m: string;
    winddirection_10m: string;
}

export interface OpenMeteoResponse {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    hourly_units: OpenMeteoHourlyUnits;
    hourly: OpenMeteoHourly;
}

export interface WeatherRow {
    site_id: string;
    time: string;
    fetched_at: string;
    temperature_2m: number;
    precipitation: number;
    windspeed_10m: number;
    windgusts_10m: number;
    winddirection_10m: number;
}