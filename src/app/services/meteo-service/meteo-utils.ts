// Créneaux horaires qu'on veut afficher
import {Condition, Direction, Site} from '../../models/meteo.models';

export const SLOTS = [9, 12, 15];

// Conversion degrés -> direction cardinale
const DIRECTIONS: Direction[] = [
  Direction.N, Direction.NNE, Direction.NE, Direction.ENE, Direction.E, Direction.ESE, Direction.SE, Direction.SSE,
  Direction.S, Direction.SSO, Direction.SO, Direction.OSO, Direction.O, Direction.ONO, Direction.NO, Direction.NNO
];

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function degreesToDirection(degrees: number): Direction {
  const index = Math.round(degrees / 22.5) % 16;
  return DIRECTIONS[index];
}

export function isDirectionFavorable(direction: Direction, favorableDirections: string[]): boolean {
  return favorableDirections.includes(direction);
}

export function calculateCondition(
  wind: number,
  gust: number,
  isDirectionOk: boolean,
  site: Site
): Condition {
  // Mauvaise direction = bad
  if (!isDirectionOk) return Condition.Bad;

  // Vent dans la plage idéale et rafales pas trop fortes
  if (wind >= site.windMin && wind <= site.windMax && gust <= site.windMax + 15) {
    return Condition.Good;
  }

  // Vent un peu hors plage mais acceptable
  if (wind <= site.windMax + 10 && gust <= site.windMax + 25) {
    return Condition.Moderate;
  }

  return Condition.Bad;
}

export function formatDayLabel(date: Date): string {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return `${days[date.getDay()]} ${date.getDate()}`;
}
