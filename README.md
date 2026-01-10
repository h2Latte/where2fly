# RazMotte - Météo Parapente

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

## Sites de vol à intégrer

| Site | Latitude | Longitude | Orientations favorables | Vent idéal |
|------|----------|-----------|------------------------|------------|
| La Comté | 50.433331 | 2.5 | O, ONO, NO, NNO | 13-25 km/h |
| Olhain | (à ajouter) | | SSO, S | 13-23 km/h |
| Licques | (à ajouter) | | SSE, S, SSO | 13-22 km/h |

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
1. Ajouter les autres sites (Olhain, Licques, etc.)
2. Ajouter une vue "meilleur créneau de la semaine"
3. Filtres par site
4. Dark mode (optionnel)
5. PWA pour mobile (optionnel)

## Conventions de code
- Standalone components uniquement
- Signals pour la réactivité (pas de RxJS pour le state local)
- Pas de Zone.js (zoneless change detection)no
