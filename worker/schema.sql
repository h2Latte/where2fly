DROP TABLE IF EXISTS weather;

CREATE TABLE weather
(
    site_id           TEXT NOT NULL,
    time              TEXT NOT NULL, -- ISO datetime heure (ex: "2026-03-18T14:00")
    fetched_at        TEXT NOT NULL,
    temperature_2m    REAL,
    precipitation     REAL,
    windspeed_10m     REAL,
    windgusts_10m     REAL,
    winddirection_10m REAL,
    PRIMARY KEY (site_id, time)
);