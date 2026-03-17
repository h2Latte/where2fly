import type {D1Database} from '@cloudflare/workers-types';
import {Site, Direction} from './model/meteo.model';

type SiteRow = {
    id: string;
    name: string;
    lat: number;
    lon: number;
    orientations: string;
    windMin: number;
    windMax: number;
};

export class SitesDAO {
    constructor(private readonly db: D1Database) {
    }

    async getAll(): Promise<Site[]> {
        const res = await this.db.prepare('SELECT * FROM sites').all<SiteRow>();
        return res.results.map(r => ({
            ...r,
            orientations: JSON.parse(r.orientations) as Direction[],
        }));
    }
}