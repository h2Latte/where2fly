# Where2fly - Météo Parapente

## Contexte du projet
Application web pour le club de parapente RazMotte (Nord-Pas-de-Calais) permettant de visualiser les conditions météo sur différents sites de vol.

Inspiré de : https://razmotte.org/meteonew/

## Stack technique
- **Angular 21** (zoneless, standalone components, signals)
- **Angular Material** pour les composants UI
- **SCSS** pour les styles
- **API Open-Meteo** (gratuite, sans clé) pour les données météo

## Structure actuelle
```
src/app/
├── models/
│   └── meteo.models.ts      # Interfaces TypeScript
├── services/
│   └── meteo.service.ts     # Appels API Open-Meteo
├── components/
│   └── meteo-table/         # Composant principal tableau météo
│       ├── meteo-table.component.ts
│       ├── meteo-table.component.html
│       └── meteo-table.component.scss
├── app.component.ts
└── app.config.ts
```

## Sites de vol intégrés

| Site | Latitude | Longitude | Orientations favorables | Vent idéal |
|------|----------|-----------|------------------------|------------|
| Olhain | 50.4343 | 2.586 | SSO, S | 13-23 km/h |
| La Comté | 50.4333 | 2.5 | O, ONO, NO, NNO | 13-25 km/h |
| Licques | 50.7855 | 1.9355 | SSE, S, SSO | 13-22 km/h |
| Equihen | 50.6796 | 1.567 | OSO, O | 15-30 km/h |
| Parc des Iles | 50.4014 | 2.9342 | SE, S | 13-25 km/h |
| Mont Saint Eloi | 50.3311 | 2.6632 | NE, SO | 13-25 km/h |
| Zuydcoote | 51.0692 | 2.4703 | O, NO, N | 15-30 km/h |
| Dune de Wissant | 50.8833 | 1.6667 | O, SO, NO, N, NE | 15-30 km/h |
| Sangatte | 50.9412 | 1.7378 | NO | 15-30 km/h |
| Escalles | 50.9167 | 1.7167 | O, NO | 15-30 km/h |
| Frencq | 50.5605 | 1.6662 | NE | 13-25 km/h |
| Cran aux Oeufs | 50.8472 | 1.5833 | SSE, S, SSO | 13-25 km/h |
| La Crèche | 50.7511 | 1.5972 | NO, O | 15-30 km/h |

## Design / UX

### Vue principale : Calendrier
- Tableau avec sites en lignes, jours en colonnes (7 jours)
- 3 créneaux par jour : 9h, 12h, 15h
- Chaque cellule affiche :
  - Direction du vent (badge vert si favorable, rouge sinon)
  - Vent moyen / rafales (km/h)
  - Température (°C)
  - Précipitations (mm)

### Code couleur conditions
- 🟢 **Vert (good)** : Direction OK + vent dans la plage idéale
- 🟠 **Orange (moderate)** : Conditions limites
- 🔴 **Rouge (bad)** : Direction défavorable ou vent trop fort
- ⬜ **Gris (closed)** : Site fermé

### Style
- Design moderne, cartes arrondies, ombres subtiles
- Fond dégradé bleu clair
- Responsive (scroll horizontal sur mobile)

## API Open-Meteo

Endpoint : `https://api.open-meteo.com/v1/forecast`

Paramètres utilisés :
```
latitude, longitude
hourly=temperature_2m,precipitation,windspeed_10m,windgusts_10m,winddirection_10m
timezone=Europe/Paris
forecast_days=7
```

## Prochaines étapes
1. ~~Ajouter les autres sites~~ ✅ (13 sites intégrés)
2. Ajouter une vue "meilleur créneau de la semaine"
3. Filtres par site
4. Dark mode (optionnel)
5. PWA pour mobile (optionnel)

## Conventions de code
- Standalone components uniquement
- Signals pour la réactivité (pas de RxJS pour le state local)
- Pas de Zone.js (zoneless change detection)
